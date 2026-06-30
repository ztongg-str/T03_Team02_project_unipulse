CREATE DATABASE IF NOT EXISTS unipulse;
USE unipulse;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  role ENUM('student', 'organizer', 'admin') NOT NULL DEFAULT 'student',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  avatar VARCHAR(255) DEFAULT NULL,
  cover_image VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  maxParticipants INT NOT NULL DEFAULT 100,
  image VARCHAR(255) DEFAULT NULL,
  status ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejectionReason VARCHAR(500) DEFAULT NULL,
  organizerId INT NOT NULL,
  verifiedBy INT DEFAULT NULL,
  verifiedAt TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verifiedBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (userId, eventId)
);

CREATE TABLE IF NOT EXISTS friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  friendId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friendId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (userId, friendId)
);

CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  icon VARCHAR(255) DEFAULT NULL,
  criteria VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  achievementId INT NOT NULL,
  earnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (userId, achievementId)
);


CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporterId INT NOT NULL,
  targetType ENUM('user', 'event') NOT NULL,
  targetId INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('pending', 'resolved') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporterId) REFERENCES users(id) ON DELETE CASCADE
);

-- Upcoming events tracking (events user registered for that haven't happened yet)
CREATE TABLE IF NOT EXISTS upcoming_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  registrationId INT NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (registrationId) REFERENCES registrations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_upcoming (userId, eventId)
);

-- Past event history (tracks attendance, XP, certificates after event ends)
CREATE TABLE IF NOT EXISTS past_event_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  registrationId INT NOT NULL,
  attended BOOLEAN DEFAULT FALSE,
  xpEarned INT DEFAULT 0,
  certificateIssued BOOLEAN DEFAULT FALSE,
  refundProcessed BOOLEAN DEFAULT FALSE,
  status ENUM('attended', 'missed') NOT NULL DEFAULT 'missed',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (registrationId) REFERENCES registrations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_history (userId, eventId)
);

CREATE TABLE IF NOT EXISTS saved_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  eventId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_saved (userId, eventId)
);

CREATE TABLE IF NOT EXISTS backups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  type ENUM('full', 'tables', 'rows') NOT NULL DEFAULT 'full',
  scope TEXT DEFAULT NULL COMMENT 'JSON description of what was backed up (table names / row ids)',
  sizeBytes BIGINT DEFAULT NULL,
  trigger_type ENUM('manual', 'scheduled') NOT NULL DEFAULT 'manual',
  status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  errorMessage VARCHAR(500) DEFAULT NULL,
  createdBy INT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_organizer ON events(organizerId);
CREATE INDEX idx_registrations_user ON registrations(userId);
CREATE INDEX idx_registrations_event ON registrations(eventId);
CREATE INDEX idx_activity_logs_user ON activity_logs(userId);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_upcoming_user ON upcoming_events(userId);
CREATE INDEX idx_history_user ON past_event_history(userId);
CREATE INDEX idx_history_status ON past_event_history(status);
CREATE INDEX idx_backups_createdAt ON backups(createdAt);

DROP TRIGGER IF EXISTS after_registration_insert;
DELIMITER //
CREATE TRIGGER after_registration_insert
AFTER INSERT ON registrations
FOR EACH ROW
BEGIN
  DECLARE event_status VARCHAR(20);
  DECLARE event_date DATETIME;
  SELECT status, date INTO event_status, event_date FROM events WHERE id = NEW.eventId;
  IF event_status = 'approved' AND event_date > NOW() THEN
    INSERT IGNORE INTO upcoming_events (userId, eventId, registrationId)
    VALUES (NEW.userId, NEW.eventId, NEW.id);
  END IF;
END//
DELIMITER ;

-- Seed 10 challenge-based achievements
INSERT IGNORE INTO achievements (id, name, description, icon, criteria) VALUES
(1, 'First Step',       'Register for your first event',                               '/icons/first_step.png',    'register_1_event'),
(2, 'Campus Regular',   'Attend 3 events',                                              '/icons/campus_regular.png','attend_3_events'),
(3, 'Social Butterfly', 'Add 3 friends on UniPulse',                                    '/icons/social.png',        'add_3_friends'),
(4, 'Networker',        'Add 10 friends on UniPulse',                                   '/icons/networker.png',     'add_10_friends'),
(5, 'Explorer',         'Register for events in 3 different categories',                '/icons/explorer.png',      'explore_3_categories'),
(6, 'Rising Star',      'Reach level 5',                                                   '/icons/rising_star.png',   'level_5'),
(7, 'Veteran',          'Reach level 10',                                                  '/icons/veteran.png',       'level_10'),
(8, 'Profile Star',     'Complete your profile with a bio and avatar',                  '/icons/profile_star.png',  'complete_profile'),
(9, 'Dedicated',        'Have 5 active registrations at once',                          '/icons/dedicated.png',     'book_5_events'),
(10,'Pentathlon',       'Earn 5 achievements',                                          '/icons/pentathlon.png',    'earn_5_achievements');
