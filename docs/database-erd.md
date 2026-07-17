# Database ERD — UniPulse

## What is an ERD?

An Entity Relationship Diagram is like a **family tree for your data**. Each box is a table (like "users" or "events"), and the lines between them show how they connect (e.g., "a user can create many events").

---

## ERD Diagram (Mermaid)

```mermaid
erDiagram
  %% ==============================
  %% USERS (hub of the whole system)
  %% ==============================
  users {
    int id PK
    varchar username UK
    varchar email UK
    varchar password
    varchar fullName
    enum role "student | organizer | superadmin | developer | coordinator"
    enum status "active | suspended"
    varchar avatar
    varchar cover_image
    text bio
    json interests
    int xp
    int level
    varchar otp
    datetime otpExpiresAt
    boolean isVerified
    timestamp createdAt
    timestamp updatedAt
  }

  %% ==============================
  %% EVENTS (created by organizers)
  %% ==============================
  events {
    int id PK
    varchar title
    text description
    datetime date
    varchar location
    varchar category
    int maxParticipants
    varchar image
    enum status "draft | pending | approved | rejected"
    varchar rejectionReason
    int organizerId FK
    varchar checkin_code UK
    int verifiedBy FK
    timestamp verifiedAt
    timestamp createdAt
    timestamp updatedAt
  }

  %% ==============================
  %% REGISTRATIONS (who signed up for what)
  %% ==============================
  registrations {
    int id PK
    int userId FK
    int eventId FK
    enum status "Registered | Attended | Missing"
    timestamp attended_at
    timestamp createdAt
  }

  %% ==============================
  %% FRIENDS (social graph)
  %% ==============================
  friends {
    int id PK
    int userId FK
    int friendId FK
    enum status "pending | accepted"
    timestamp createdAt
  }

  %% ==============================
  %% ACHIEVEMENTS (badge definitions)
  %% ==============================
  achievements {
    int id PK
    varchar name
    text description
    varchar icon
    varchar criteria
    timestamp createdAt
  }

  %% ==============================
  %% USER_ACHIEVEMENTS (who earned what badge)
  %% ==============================
  user_achievements {
    int id PK
    int userId FK
    int achievementId FK
    timestamp earnedAt
  }

  %% ==============================
  %% ACTIVITY_LOGS (audit trail)
  %% ==============================
  activity_logs {
    int id PK
    int userId FK
    varchar action
    text details
    timestamp createdAt
  }

  %% ==============================
  %% REPORTS (user reports)
  %% ==============================
  reports {
    int id PK
    int reporterId FK
    enum targetType "user | event"
    int targetId
    varchar reason
    text description
    enum status "pending | resolved"
    timestamp createdAt
    timestamp updatedAt
  }

  %% ==============================
  %% UPCOMING_EVENTS (future registrations)
  %% ==============================
  upcoming_events {
    int id PK
    int userId FK
    int eventId FK
    int registrationId FK
    boolean notified
    timestamp createdAt
  }

  %% ==============================
  %% PAST_EVENT_HISTORY (attendance records)
  %% ==============================
  past_event_history {
    int id PK
    int userId FK
    int eventId FK
    int registrationId FK
    boolean attended
    int xpEarned
    boolean certificateIssued
    boolean refundProcessed
    enum status "attended | missed"
    timestamp createdAt
    timestamp updatedAt
  }

  %% ==============================
  %% SAVED_EVENTS (bookmarks)
  %% ==============================
  saved_events {
    int id PK
    int userId FK
    int eventId FK
    timestamp createdAt
  }

  %% ==============================
  %% BACKUPS
  %% ==============================
  backups {
    int id PK
    varchar filename
    enum type "full | tables | rows"
    text scope
    bigint sizeBytes
    enum trigger_type "manual | scheduled"
    enum status "success | failed"
    varchar errorMessage
    int createdBy FK
    timestamp createdAt
  }

  %% ==============================
  %% RBAC: CUSTOM ADMIN ROLES
  %% ==============================
  admin_roles {
    int id PK
    varchar name UK
    text description
    json permissions
    boolean is_system
    int createdBy FK
    timestamp createdAt
    timestamp updatedAt
  }

  user_admin_roles {
    int id PK
    int userId FK
    int roleId FK
    int assignedBy FK
    timestamp createdAt
  }

  admin_credentials {
    int id PK
    int userId FK UK
    varchar email
    text password_encrypted
    int createdBy FK
    timestamp createdAt
  }

  %% ==============================
  %% RELATIONSHIPS
  %% ==============================

  %% Users → Events (one user creates many events)
  users ||--o{ events : "creates"
  users ||--o{ registrations : "registers for"
  users ||--o{ friends : "sends friend request"
  users ||--o{ user_achievements : "earns"
  users ||--o{ activity_logs : "has log entry"
  users ||--o{ reports : "reports"
  users ||--o{ upcoming_events : "has upcoming"
  users ||--o{ past_event_history : "has history"
  users ||--o{ saved_events : "saves"
  users ||--o{ backups : "creates"

  %% Events → related tables
  events ||--o{ registrations : "has registrations"
  events ||--o{ upcoming_events : "appears in"
  events ||--o{ past_event_history : "appears in"
  events ||--o{ saved_events : "is saved"

  %% Registrations → related history tables
  registrations ||--o{ upcoming_events : "triggers"
  registrations ||--o{ past_event_history : "logs to"

  %% Achievements
  achievements ||--o{ user_achievements : "earned by"

  %% Admin RBAC
  admin_roles ||--o{ user_admin_roles : "assigned to"
  users ||--o{ user_admin_roles : "has role"
  users ||--o{ admin_credentials : "has credentials"
```

---

## Table-by-Table Explanation

### 1. `users` — The Hub
Every person in the app lives here: students, organizers, and admins. All other tables connect back to `users` with a `userId` foreign key. Think of it as the central phonebook.

### 2. `events` — Campus Events
Organizers create events. Each event belongs to one organizer (`organizerId` → `users.id`). An admin can verify an event (`verifiedBy` → `users.id`). Every event has a 6-digit `checkin_code` that students can type instead of scanning QR.

### 3. `registrations` — The "Who Signed Up" Bridge
This is a **many-to-many** link: one student can register for many events, and one event can have many students. It also tracks attendance `status` (Registered → Attended → Missing) and when they checked in (`attended_at`).

### 4. `friends` — Social Connections
Links two users as friends. Has a `status` column: `pending` (request sent, not yet accepted) or `accepted`. The `unique_friendship` constraint prevents duplicate friend requests.

### 5. `achievements` — Badge Definitions
Stores the list of possible badges (like "First Step", "Social Butterfly"). Each has a name, description, icon, and criteria (what triggers it).

### 6. `user_achievements` — Who Earned What
Links a user to an achievement they've unlocked. When someone completes the criteria, a row is inserted here.

### 7. `activity_logs` — Audit Trail
Every important action a user takes is logged here: "sent friend request", "registered for event", "checked in". This helps with debugging and user history.

### 8. `reports` — User Reports
When someone reports an inappropriate event or another user, a row goes here. Admins can mark it as `resolved`.

### 9. `upcoming_events` — Future Registrations
When a student registers for an approved future event, a row is automatically created here by a **database trigger** (see `schema.sql` line 176-189). This makes it fast to show "Your Upcoming Events" without joining multiple tables.

### 10. `past_event_history` — Attendance Records
After an event happens, this table records whether the student attended, how much XP they earned, and whether a certificate was issued. The cleanup job marks no-shows as "Missed" here.

### 11. `saved_events` — Bookmarks
Students can bookmark events they're interested in but haven't registered for yet. Simple link table between `users` and `events`.

### 12. `backups` — Backup Records
Every time a backup runs (manual or scheduled), a record is created here with the filename, size, and status. The actual `.sql` files are stored in `back/backups/`.

### 13. `admin_roles` — Custom Permission Sets
Defines reusable permission bundles like "Event Manager" or "User Manager". Each role has a JSON column listing what features it can access.

### 14. `user_admin_roles` — Who Has Which Admin Role
Links an admin user to their custom role(s). A user can have multiple roles.

### 15. `admin_credentials` — Encrypted Admin Logins
Stores admin login credentials in encrypted form for recovery purposes.

---

## Data Flow Summary

```
Student signs up → row in `users`
     ↓
Registers for event → row in `registrations`
     ↓
Trigger fires → row in `upcoming_events` (if event is approved & in future)
     ↓
Arrives at venue → scans QR or enters 6-digit code
     ↓
Check-in → `registrations.status` = 'Attended', `attended_at` = now
         → `past_event_history` updated/created with XP
         → `users.xp` increased, `level` may increase
         → `upcoming_events` row deleted
```
