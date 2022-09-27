-- Adminer 4.8.1 MySQL 5.6.51 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `shj_assignments`;
CREATE TABLE `shj_assignments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT '',
  `total_submits` int(11) unsigned NOT NULL,
  `open` tinyint(1) NOT NULL,
  `scoreboard` tinyint(1) NOT NULL,
  `javaexceptions` tinyint(1) NOT NULL,
  `description` text NOT NULL,
  `start_time` datetime NOT NULL,
  `finish_time` datetime NOT NULL,
  `extra_time` int(11) NOT NULL,
  `late_rule` text NOT NULL,
  `participants` text NOT NULL,
  `moss_update` varchar(30) NOT NULL DEFAULT 'Never',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_languages`;
CREATE TABLE `shj_languages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL DEFAULT '0',
  `extension` varchar(8) NOT NULL,
  `default_time_limit` int(11) unsigned NOT NULL DEFAULT '500',
  `default_memory_limit` int(11) unsigned NOT NULL DEFAULT '50000',
  `sorting` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `extension` (`extension`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `shj_languages` (`id`, `name`, `extension`, `default_time_limit`, `default_memory_limit`, `sorting`) VALUES
(1,	'C',	'c',	500,	50000,	20),
(2,	'C++',	'cpp',	500,	50000,	10),
(3,	'Java',	'java',	500,	50000,	30),
(4,	'Python 3',	'py3',	500,	50000,	40),
(5,	'Python 2',	'py2',	500,	50000,	50),
(6,	'Free Pascal',	'pas',	500,	50000,	60),
(7,	'numpy-mp',	'numpy',	500,	50000,	70);

DROP TABLE IF EXISTS `shj_migrations`;
CREATE TABLE `shj_migrations` (
  `version` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_notifications`;
CREATE TABLE `shj_notifications` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL DEFAULT '',
  `text` text NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_problems`;
CREATE TABLE `shj_problems` (
  `id` int(11) unsigned NOT NULL,
  `name` varchar(150) DEFAULT '',
  `is_upload_only` tinyint(1) NOT NULL DEFAULT '0',
  `diff_cmd` varchar(20) NOT NULL DEFAULT 'diff',
  `diff_arg` varchar(20) NOT NULL DEFAULT '-bB',
  `admin_note` varchar(1500) DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_problem_assignment`;
CREATE TABLE `shj_problem_assignment` (
  `assignment_id` int(11) unsigned NOT NULL,
  `problem_id` int(11) unsigned NOT NULL,
  `score` int(11) NOT NULL,
  `ordering` int(11) NOT NULL,
  `problem_name` varchar(150) NOT NULL DEFAULT '',
  PRIMARY KEY (`assignment_id`,`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_problem_language`;
CREATE TABLE `shj_problem_language` (
  `language_id` int(11) unsigned NOT NULL,
  `problem_id` int(11) unsigned NOT NULL,
  `time_limit` int(11) unsigned NOT NULL DEFAULT '500',
  `memory_limit` int(11) unsigned NOT NULL DEFAULT '50000',
  PRIMARY KEY (`language_id`,`problem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_queue`;
CREATE TABLE `shj_queue` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `submit_id` int(11) unsigned NOT NULL,
  `username` varchar(20) NOT NULL,
  `assignment` smallint(4) unsigned NOT NULL,
  `problem` smallint(4) unsigned NOT NULL,
  `type` varchar(8) NOT NULL,
  `process_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_scoreboard`;
CREATE TABLE `shj_scoreboard` (
  `assignment` smallint(4) unsigned NOT NULL,
  `scoreboard` longtext NOT NULL,
  KEY `assignment` (`assignment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_sessions`;
CREATE TABLE `shj_sessions` (
  `session_id` varchar(40) NOT NULL DEFAULT '0',
  `ip_address` varchar(45) NOT NULL DEFAULT '0',
  `user_agent` varchar(120) NOT NULL,
  `last_activity` int(10) unsigned NOT NULL DEFAULT '0',
  `user_data` text NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_settings`;
CREATE TABLE `shj_settings` (
  `shj_key` varchar(50) NOT NULL,
  `shj_value` text NOT NULL,
  KEY `shj_key` (`shj_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `shj_settings` (`shj_key`, `shj_value`) VALUES
('concurent_queue_process',	'2'),
('default_language_number',	'2'),
('site_name',	'WECODE'),
('timezone',	'Asia/Ho_Chi_Minh'),
('tester_path',	'/home/ubuntu/wecode2/wecode-judge/tester'),
('assignments_root',	'/home/ubuntu/wecode2/wecode-judge/assignments'),
('file_size_limit',	'50000'),
('output_size_limit',	'1024'),
('queue_is_working',	'0'),
('default_late_rule',	'/* \r\n * Put coefficient (from 100) in variable $coefficient.\r\n * You can use variables $extra_time and $delay.\r\n * $extra_time is the total extra time given to users\r\n * (in seconds) and $delay is number of seconds passed\r\n * from finish time (can be negative).\r\n *  In this example, $extra_time is 172800 (2 days):\r\n */\r\n\r\nif ($delay<=0)\r\n  // no delay\r\n  $coefficient = 100;\r\n\r\nelseif ($delay<=3600)\r\n  // delay less than 1 hour\r\n  $coefficient = ceil(100-((30*$delay)/3600));\r\n\r\nelseif ($delay<=86400)\r\n  // delay more than 1 hour and less than 1 day\r\n  $coefficient = 70;\r\n\r\nelseif (($delay-86400)<=3600)\r\n  // delay less than 1 hour in second day\r\n  $coefficient = ceil(70-((20*($delay-86400))/3600));\r\n\r\nelseif (($delay-86400)<=86400)\r\n  // delay more than 1 hour in second day\r\n  $coefficient = 50;\r\n\r\nelseif ($delay > $extra_time)\r\n  // too late\r\n  $coefficient = 0;'),
('enable_c_shield',	'0'),
('enable_cpp_shield',	'0'),
('enable_py2_shield',	'0'),
('enable_py3_shield',	'0'),
('enable_java_policy',	'0'),
('enable_log',	'0'),
('submit_penalty',	'300'),
('enable_registration',	'1'),
('registration_code',	'0'),
('mail_from',	'dhcntt@uit.edu.vn'),
('mail_from_name',	'UIT Code Contest'),
('reset_password_mail',	'<p>\r\nSomeone requested a password reset for your {SITE_NAME} Wecode Judge account at {SITE_URL}.\r\n</p>\r\n<p>\r\nTo change your password, visit this link:\r\n</p>\r\n<p>\r\n<a href=\"{RESET_LINK}\">Reset Password</a>\r\n</p>\r\n<p>\r\nThe link is valid for {VALID_TIME}. If you don\'t want to change your password, just ignore this email.\r\n</p>'),
('add_user_mail',	'<p>\r\nHello! You are registered in http://thilaptrinh.uit.edu.vn/wecode Wecode Judge at http://thilaptrinh.uit.edu.vn/wecode as Student.\r\n</p>\r\n<p>\r\nYour username: {USERNAME}\r\n</p>\r\n<p>\r\nYour password: {PASSWORD}\r\n</p>\r\n<p>\r\nYou can log in at <a href=\"http://thilaptrinh.uit.edu.vn/wecode\">{LOGIN_URL}</a>\r\n</p>'),
('moss_userid',	'1796'),
('results_per_page_all',	'40'),
('results_per_page_final',	'80'),
('week_start',	'1'),
('theme',	'default');

DROP TABLE IF EXISTS `shj_submissions`;
CREATE TABLE `shj_submissions` (
  `submit_id` int(11) unsigned NOT NULL,
  `username` varchar(20) NOT NULL,
  `assignment_id` int(11) unsigned NOT NULL,
  `problem_id` int(11) unsigned DEFAULT NULL,
  `is_final` tinyint(1) NOT NULL DEFAULT '0',
  `time` datetime NOT NULL,
  `status` varchar(100) NOT NULL,
  `pre_score` int(11) NOT NULL,
  `coefficient` varchar(6) NOT NULL,
  `file_name` varchar(30) NOT NULL,
  `language_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`submit_id`,`assignment_id`),
  KEY `assignment_submit_id` (`assignment_id`,`submit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `shj_users`;
CREATE TABLE `shj_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(100) NOT NULL,
  `display_name` varchar(40) NOT NULL DEFAULT '',
  `email` varchar(40) NOT NULL,
  `role` varchar(20) NOT NULL,
  `passchange_key` varchar(60) NOT NULL DEFAULT '',
  `passchange_time` datetime DEFAULT NULL,
  `first_login_time` datetime DEFAULT NULL,
  `last_login_time` datetime DEFAULT NULL,
  `selected_assignment` smallint(4) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `shj_users` (`id`, `username`, `password`, `display_name`, `email`, `role`, `passchange_key`, `passchange_time`, `first_login_time`, `last_login_time`, `selected_assignment`) VALUES
(1785,	'sunnie',	'$2a$08$k7BuE9s83J4FRZFoL0d0rOmVw6c1mPiAWSQo6Gsh7ENDszZbmBQFi',	'Van A',	'20521845@gm.uit.edu.vn',	'admin',	'',	NULL,	'2022-06-26 14:45:07',	'2022-07-19 19:21:25',	41);

DROP TABLE IF EXISTS `sqlmapoutput`;
CREATE TABLE `sqlmapoutput` (
  `data` longtext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `cmd` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `user` (`cmd`) VALUES
('root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\nlp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin\nmail:x:8:8:mail:/var/mail:/usr/sbin/nologin\nnews:x:9:9:news:/var/spool/news:/usr/sbin/nologin\nuucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin\nproxy:x:13:13:proxy:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nlist:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin\nirc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin\ngnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n_apt:x:100:65534::/nonexistent:/usr/sbin/nologin\nmysql:x:999:999::/home/mysql:/bin/sh\n'),
(NULL),
(NULL),
(NULL),
(NULL),
(NULL),
('root:x:0:0:root:/root:/bin/bash\\\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\\\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\\\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\\\nsync:x:4:65534:sync:/bin:/bin/sync\\\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\\\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\\\nlp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin\\\nmail:x:8:8:mail:/var/mail:/usr/sbin/nologin\\\nnews:x:9:9:news:/var/spool/news:/usr/sbin/nologin\\\nuucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin\\\nproxy:x:13:13:proxy:/bin:/usr/sbin/nologin\\\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\\\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\\\nlist:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin\\\nirc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin\\\ngnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin\\\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\\\n_apt:x:100:65534::/nonexistent:/usr/sbin/nologin\\\nmysql:x:999:999::/home/mysql:/bin/sh\\\n\n'),
(NULL);

-- 2022-07-23 13:52:07
