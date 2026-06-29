-- Clear existing user_achievements and achievements, then seed 10 focused ones
DELETE FROM user_achievements;
DELETE FROM achievements;

INSERT INTO achievements (id, name, description, icon, criteria) VALUES
(1, 'First Step',    'Register for your first event',                               '/icons/first_step.png',    'register_1_event'),
(2, 'Campus Regular','Attend 3 events',                                              '/icons/campus_regular.png','attend_3_events'),
(3, 'Social Butterfly','Add 3 friends on UniPulse',                                  '/icons/social.png',        'add_3_friends'),
(4, 'Networker',     'Add 10 friends on UniPulse',                                   '/icons/networker.png',     'add_10_friends'),
(5, 'Explorer',      'Register for events in 3 different categories',                '/icons/explorer.png',      'explore_3_categories'),
(6, 'Streak Starter', 'Maintain a 3-day activity streak',                            '/icons/streak_start.png',  'streak_3_days'),
(7, 'Streak Master',  'Maintain a 7-day activity streak',                            '/icons/streak_master.png', 'streak_7_days'),
(8, 'Profile Star',   'Complete your profile with a bio and avatar',                 '/icons/profile_star.png',  'complete_profile'),
(9, 'Dedicated',      'Have 5 active registrations at once',                         '/icons/dedicated.png',     'book_5_events'),
(10,'Pentathlon',     'Earn 5 achievements',                                          '/icons/pentathlon.png',    'earn_5_achievements');
