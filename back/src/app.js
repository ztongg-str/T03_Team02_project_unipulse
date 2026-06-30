import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import otpRoutes from './modules/auth/otp.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import registrationsRoutes from './modules/registrations/registrations.routes.js';
import friendsRoutes from './modules/friends/friends.routes.js';
import achievementsRoutes from './modules/achievements/achievements.routes.js';
import activityLogsRoutes from './modules/activityLogs/activityLogs.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import backupRoutes from './modules/backup/backup.routes.js';
import historyRoutes from './modules/history/history.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import savedEventsRoutes from './modules/savedEvents/savedEvents.routes.js';
import queryConsoleRoutes from './modules/queryConsole/queryConsole.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'UniPulse API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/otp', otpRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/saved-events', savedEventsRoutes);
app.use('/api/query-console', queryConsoleRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
