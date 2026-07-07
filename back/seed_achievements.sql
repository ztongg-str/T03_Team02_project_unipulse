-- Clear existing user_achievements and achievements, then seed 10 focused ones
DELETE FROM user_achievements;
DELETE FROM achievements;

INSERT INTO achievements (id, name, description, icon, criteria) VALUES
(1, 'First Step',    'Register for your first event',                               '👣', 'register_1_event'),
(2, 'Campus Regular','Attend 3 events',                                              '🏛️', 'attend_3_events'),
(3, 'Social Butterfly','Add 3 friends on UniPulse',                                  '🦋', 'add_3_friends'),
(4, 'Networker',     'Add 10 friends on UniPulse',                                   '🤝', 'add_10_friends'),
(5, 'Explorer',      'Register for events in 3 different categories',                '🧭', 'explore_3_categories'),
(6, 'Rising Star',    'Reach level 5',                                                '⭐', 'level_5'),
(7, 'Veteran',        'Reach level 10',                                               '🎖️', 'level_10'),
(8, 'Profile Star',   'Complete your profile with bio and photo',                    '🌟', 'complete_profile'),
(9, 'Dedicated',      'Have 5 active registrations at once',                         '🔥', 'book_5_events'),
(10,'Pentathlon',     'Earn 5 achievements',                                          '🏅', 'earn_5_achievements');
