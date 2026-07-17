# Query Optimization — UniPulse

## What is Query Optimization?

When your app talks to the database, it sends **SQL queries** (e.g., "find all approved events happening next week"). Query optimization is about making those queries run as fast as possible — so pages load instantly even when you have thousands of users and events.

Think of it like **organizing a library**:
- Without optimization: you search every shelf, every book, one by one
- With optimization: you check the catalog (index), go to the exact aisle, grab the book

---

## What We Already Have

### 1. Database Indexes — The "Table of Contents"

An **index** is like the index at the back of a textbook. Instead of flipping every page to find "Photosynthesis", you check the index and go straight to page 142.

Here are the indexes already in our database:

| Index Name | On Table & Column | What It Speeds Up |
|---|---|---|
| `idx_users_role` | `users(role)` | Filtering users by role (e.g., "find all organizers") |
| `idx_users_status` | `users(status)` | Filtering active vs suspended users |
| `idx_events_status` | `events(status)` | Finding approved/pending/draft events |
| `idx_events_date` | `events(date)` | Finding events by date (e.g., "events this week") |
| `idx_events_organizer` | `events(organizerId)` | "Show me my events" — organizer dashboard |
| `idx_events_checkin_code` | `events(checkin_code)` | Looking up event by 6-digit code |
| `idx_registrations_user` | `registrations(userId)` | "What events did I register for?" |
| `idx_registrations_event` | `registrations(eventId)` | "Who registered for my event?" — organizer view |
| `idx_activity_logs_user` | `activity_logs(userId)` | Loading a user's activity feed |
| `idx_reports_status` | `reports(status)` | Admin viewing pending reports |
| `idx_upcoming_user` | `upcoming_events(userId)` | Student "My Upcoming Events" page |
| `idx_history_user` | `past_event_history(userId)` | Loading attendance history |
| `idx_history_status` | `past_event_history(status)` | Filtering by attended/missed |
| `idx_backups_createdAt` | `backups(createdAt)` | Sorting backup records by date |

**In simple terms:** Each index is like a shortcut. Without the `idx_events_organizer` index, MySQL would have to read **every single event row** to find the ones created by you. With the index, it jumps directly to your events.

### 2. Connection Pooling — "Always Have a Cab Waiting"

In `back/src/config/database.js`, we configured a **connection pool**:

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,   // max 10 connections ready at once
  waitForConnections: true,  // queue up if all 10 are busy
  queueLimit: 0,         // no limit on how many can wait
});
```

**What this means:**
- Without a pool: every time a user loads a page, the app creates a new database connection, uses it, then destroys it. Creating a connection takes time (like calling a taxi and waiting for it to arrive).
- With a pool: 10 connections are kept alive and ready. When a user needs data, they grab a waiting connection (like getting into a waiting taxi), use it, and return it. Much faster.

### 3. Unique Constraints — Prevent Duplicates

These aren't indexes for speed — they're for **data integrity** (preventing bad data):

- `unique_registration` — A student can't register for the same event twice
- `unique_friendship` — Can't send duplicate friend requests
- `unique_user_achievement` — Can't earn the same badge twice
- `unique_upcoming` — Can't double-add to upcoming events
- `unique_history` — Only one history record per user per event
- `unique_saved` — Can't bookmark the same event twice

---

## New Addition: Slow Query Logger

We just added a **slow query logger** in `back/src/middlewares/slowQueryLogger.js`.

**What it does:**
- Every API request is timed
- If any request takes **longer than 1 second**, a warning is logged to the console
- The log shows: the HTTP method, the URL, and how long it took

**Why this helps:**
- Without it, you'd never know if a query was slow until a user complains
- With it, you can watch the server console and catch performance problems as they happen
- Example output: `[SLOW] POST /api/attendance/checkin took 3.2s` — then you know to investigate that endpoint

**When you see a slow query, you can:**
1. Check if the table has the right index
2. Run `EXPLAIN SELECT ...` to see how MySQL is executing it
3. Add or adjust indexes as needed

---

## New Addition: Composite Index

We also added a **composite index** (migration `006_composite_indexes.sql`):

```sql
CREATE INDEX idx_events_status_date ON events(status, date);
```

**What's a composite index?**
It's an index on **two columns at once**. Like a phonebook sorted by `(LastName, FirstName)` — if you search for "Smith, John", it's fast because both columns are indexed together.

**Why we need it:**
The most common query in the app is:
```sql
SELECT * FROM events WHERE status = 'approved' AND date >= NOW() ORDER BY date ASC
```
This runs on the homepage, events listing, and student dashboard.

With separate indexes on `status` and `date`, MySQL can only use **one** of them (it guesses which is better). With a composite index on `(status, date)`, MySQL uses both columns together — much faster.

**Think of it like this:**
- Two separate indexes = two phonebooks: one sorted by city, another sorted by name. To find "John Smith in New York", you'd look in the city book for New York, then manually scan all New York entries for John Smith.
- One composite index = one phonebook sorted by (city, name). You flip directly to "New York, Smith, John" in one go.

---

## What We Could Add in the Future

| Improvement | What It Does | Effort |
|---|---|---|
| **Page-based caching** | Store query results in memory so repeated requests don't hit the DB at all (e.g., event list refreshes every 60s instead of on every page load) | Medium |
| **Redis** | In-memory cache that's much faster than MySQL — store session data, frequent queries | High |
| **Pagination optimization** | Use "cursor-based" pagination instead of `OFFSET` for large datasets | Low |
| **Read replicas** | Split reads (SELECT) and writes (INSERT/UPDATE) across different database servers | Very High |
| **Query monitoring dashboard** | Visual interface showing slow queries, index usage, and table sizes | Medium |

---

## How to Use EXPLAIN (Debugging Tool)

If a page feels slow, you can check what MySQL is doing:

```sql
EXPLAIN SELECT * FROM events WHERE status = 'approved' AND date >= NOW();
```

The output will show you:
- `type` — `ref` (good, using index) vs `ALL` (bad, scanning every row)
- `rows` — how many rows MySQL had to look at
- `Extra` — `Using index` (great) vs `Using filesort` (could be better)

**Rule of thumb:**
- If `rows` is the same as the total table size → missing an index
- If `type` is `ALL` → you need an index on the `WHERE` columns
- If `Extra` says "Using filesort" → you might need an index on the `ORDER BY` column
