ALTER TABLE users
ADD COLUMN interests JSON DEFAULT NULL AFTER bio;

UPDATE users SET interests = JSON_ARRAY('[]') WHERE interests IS NULL;
