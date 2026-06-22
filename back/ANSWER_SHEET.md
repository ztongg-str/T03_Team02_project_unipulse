# UniPulse Backend — Answer Sheet

## Structure Overview

```
back/
├── src/
│   ├── config/
│   │   ├── database.js          🔲 TODO
│   │   ├── env.js               🔲 TODO
│   │   └── logger.js            🔲 TODO
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js     🔲 TODO
│   │   ├── roleMiddleware.js     🔲 TODO
│   │   ├── validationMiddleware.js  🔲 TODO
│   │   └── errorMiddleware.js   🔲 TODO
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js       🔲 TODO
│   │   │   ├── auth.controller.js   🔲 TODO
│   │   │   ├── auth.service.js      🔲 TODO
│   │   │   └── auth.repository.js   🔲 TODO
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.js       🔲 TODO
│   │   │   ├── users.controller.js   🔲 TODO
│   │   │   ├── users.service.js      🔲 TODO
│   │   │   └── users.repository.js   🔲 TODO
│   │   │
│   │   ├── events/
│   │   │   ├── events.routes.js       🔲 TODO
│   │   │   ├── events.controller.js   🔲 TODO
│   │   │   ├── events.service.js      🔲 TODO
│   │   │   └── events.repository.js   🔲 TODO
│   │   │
│   │   ├── registrations/
│   │   │   ├── registrations.routes.js       🔲 TODO
│   │   │   ├── registrations.controller.js   🔲 TODO
│   │   │   ├── registrations.service.js      🔲 TODO
│   │   │   └── registrations.repository.js   🔲 TODO
│   │   │
│   │   ├── friends/
│   │   │   ├── friends.routes.js       🔲 TODO
│   │   │   ├── friends.controller.js   🔲 TODO
│   │   │   ├── friends.service.js      🔲 TODO
│   │   │   └── friends.repository.js   🔲 TODO
│   │   │
│   │   ├── achievements/
│   │   │   ├── achievements.routes.js       🔲 TODO
│   │   │   ├── achievements.controller.js   🔲 TODO
│   │   │   ├── achievements.service.js      🔲 TODO
│   │   │   └── achievements.repository.js   🔲 TODO
│   │   │
│   │   ├── streaks/
│   │   │   ├── streaks.routes.js       🔲 TODO
│   │   │   ├── streaks.controller.js   🔲 TODO
│   │   │   ├── streaks.service.js      🔲 TODO
│   │   │   └── streaks.repository.js   🔲 TODO
│   │   │
│   │   ├── activityLogs/
│   │   │   ├── activityLogs.routes.js       🔲 TODO
│   │   │   ├── activityLogs.controller.js   🔲 TODO
│   │   │   ├── activityLogs.service.js      🔲 TODO
│   │   │   └── activityLogs.repository.js   🔲 TODO
│   │   │
│   │   ├── reports/
│   │   │   ├── reports.routes.js       🔲 TODO
│   │   │   ├── reports.controller.js   🔲 TODO
│   │   │   ├── reports.service.js      🔲 TODO
│   │   │   └── reports.repository.js   🔲 TODO
│   │   │
│   │   ├── admin/
│   │   │   ├── admin.routes.js       🔲 TODO
│   │   │   ├── admin.controller.js   🔲 TODO
│   │   │   ├── admin.service.js      🔲 TODO
│   │   │   └── admin.repository.js   🔲 TODO
│   │   │
│   │   └── backup/
│   │       ├── backup.routes.js       🔲 TODO
│   │       ├── backup.controller.js   🔲 TODO
│   │       ├── backup.service.js      🔲 TODO
│   │       └── backup.repository.js   🔲 TODO
│   │
│   ├── utils/
│   │   ├── jwt.js                🔲 TODO
│   │   ├── password.js           🔲 TODO
│   │   ├── response.js           🔲 TODO
│   │   └── validator.js          🔲 TODO
│   │
│   ├── app.js                    🔲 TODO
│   └── server.js                 🔲 TODO
│
├── uploads/                      📁 empty
├── backups/                      📁 empty
├── tests/                        📁 empty
├── .env                          🔲 TODO
├── package.json                  ✅ done
├── schema.sql                    🔲 TODO
└── ANSWER_SHEET.md               📄 this file
```

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔲 TODO | Needs implementation |
| ✅ done | Already completed |
| 📁 empty | Placeholder directory |
| 📄      | Documentation file |

## Architecture Pattern

Every module follows this layered architecture:

```
Route → Controller → Service → Repository → Database
```

## API Endpoints Summary

| Module | Method | Endpoint | Auth | Role |
|--------|--------|----------|------|------|
| Auth | POST | /api/auth/register | - | - |
| Auth | POST | /api/auth/login | - | - |
| Auth | GET | /api/auth/me | ✅ | - |
| Users | GET | /api/users/profile | ✅ | - |
| Users | PUT | /api/users/profile | ✅ | - |
| Users | GET | /api/users/:id | ✅ | - |
| Users | GET | /api/users | ✅ | admin |
| Events | GET | /api/events | ✅ | - |
| Events | GET | /api/events/upcoming | ✅ | - |
| Events | GET | /api/events/my | ✅ | organizer |
| Events | GET | /api/events/:id | ✅ | - |
| Events | POST | /api/events | ✅ | organizer, admin |
| Events | PUT | /api/events/:id | ✅ | organizer, admin |
| Events | DELETE | /api/events/:id | ✅ | organizer, admin |
| Events | PATCH | /api/events/:id/approve | ✅ | admin |
| Events | PATCH | /api/events/:id/reject | ✅ | admin |
| Events | PATCH | /api/events/:id/ban | ✅ | admin |
| Registrations | POST | /api/registrations | ✅ | - |
| Registrations | DELETE | /api/registrations/:id | ✅ | - |
| Registrations | GET | /api/registrations/my | ✅ | - |
| Registrations | GET | /api/registrations/event/:eventId | ✅ | organizer, admin |
| Friends | GET | /api/friends | ✅ | - |
| Friends | GET | /api/friends/search | ✅ | - |
| Friends | POST | /api/friends/add/:userId | ✅ | - |
| Friends | DELETE | /api/friends/:id | ✅ | - |
| Friends | GET | /api/friends/profile/:userId | ✅ | - |
| Achievements | GET | /api/achievements | ✅ | - |
| Achievements | GET | /api/achievements/all | ✅ | admin, organizer |
| Achievements | POST | /api/achievements | ✅ | admin, organizer |
| Achievements | PUT | /api/achievements/:id | ✅ | admin, organizer |
| Achievements | DELETE | /api/achievements/:id | ✅ | admin |
| Streaks | GET | /api/streaks | ✅ | - |
| Streaks | GET | /api/streaks/all | ✅ | admin, organizer |
| Streaks | POST | /api/streaks | ✅ | admin, organizer |
| Streaks | PUT | /api/streaks/:id | ✅ | admin, organizer |
| Streaks | DELETE | /api/streaks/:id | ✅ | admin |
| Activity Logs | GET | /api/activity-logs | ✅ | - |
| Reports | POST | /api/reports | ✅ | - |
| Reports | GET | /api/reports | ✅ | admin |
| Reports | PATCH | /api/reports/:id/resolve | ✅ | admin |
| Reports | DELETE | /api/reports/:id | ✅ | admin |
| Admin | GET | /api/admin/dashboard | ✅ | admin |
| Admin | GET | /api/admin/logs | ✅ | admin |
| Admin | GET | /api/admin/users | ✅ | admin |
| Admin | PATCH | /api/admin/users/:id/ban | ✅ | admin |
| Admin | PATCH | /api/admin/users/:id/unban | ✅ | admin |
| Admin | GET | /api/admin/events | ✅ | admin |
| Backup | POST | /api/backup/full | ✅ | admin |
| Backup | POST | /api/backup/incremental | ✅ | admin |
| Backup | POST | /api/backup/restore | ✅ | admin |
| Backup | GET | /api/backup | ✅ | admin |

## Database Tables (8 tables)

| Table | Purpose |
|-------|---------|
| users | Students, organizers, admins |
| events | Events created by organizers |
| registrations | Many-to-many users ↔ events |
| friends | Bidirectional friendships |
| achievements | Achievement definitions |
| user_achievements | Many-to-many users ↔ achievements |
| streaks | User streak tracking |
| activity_logs | Audit trail for user actions |
| reports | User/event reports by students |
