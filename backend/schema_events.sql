-- ET Media Hub Events Table Schema & Sample Data for Hostinger phpMyAdmin
-- Database: u409108324_ETMedia

CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` VARCHAR(100) NOT NULL,
  `time` VARCHAR(100) DEFAULT '09:00 AM — 06:00 PM',
  `city` VARCHAR(100) NOT NULL,
  `venue` VARCHAR(255) DEFAULT 'Main Convention Center',
  `locations` TEXT,
  `description` TEXT NOT NULL,
  `image` TEXT,
  `speakers` INT DEFAULT 20,
  `status` VARCHAR(50) DEFAULT 'published',
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial sample events
INSERT IGNORE INTO `events` (`id`, `slug`, `title`, `category`, `date`, `time`, `city`, `venue`, `locations`, `description`, `image`, `speakers`, `status`, `is_featured`) VALUES
('EVT-101', 'cfo-leadership-summit-2026', 'India CFO & Finance Leadership Summit 2026', 'Conference & Leadership', 'October 24, 2026', '09:00 AM — 06:00 PM', 'Mumbai', 'The St. Regis, Lower Parel', '[{"city":"Mumbai","venue":"The St. Regis, Lower Parel","date":"2026-10-24","time":"09:00 AM — 06:00 PM"}]', 'Reinventing capital allocation, enterprise risk, treasury compliance & AI-driven financial strategies.', '/assets/event-cfo-BjslOJNi.jpg', 28, 'published', 1),
('EVT-102', 'hr-excellence-awards-2026', 'National HR Excellence & Workplace Awards', 'Awards & Recognition', 'November 18, 2026', '05:00 PM — 10:00 PM', 'Bengaluru', 'JW Marriott Hotel, UB City', '[{"city":"Bengaluru","venue":"JW Marriott Hotel, UB City","date":"2026-11-18","time":"05:00 PM — 10:00 PM"}]', 'Honouring chief human resource officers and benchmark organisations building elite workforce cultures.', '/assets/event-hr-Cswpuq5H.jpg', 16, 'published', 1),
('EVT-103', 'tech-enterprise-summit-2026', 'Enterprise Technology & AI Leadership Conclave', 'Summit & Tech', 'December 05, 2026', '09:30 AM — 05:30 PM', 'Hyderabad', 'HICC Novotel, Hitec City', '[{"city":"Hyderabad","venue":"HICC Novotel, Hitec City","date":"2026-12-05","time":"09:30 AM — 05:30 PM"}]', 'Connecting CIOs, CTOs, and tech leaders deploying generative AI, cloud infrastructure & cybersecurity.', '/assets/hero-summit-ClCGVqfO.jpg', 34, 'published', 1),
('EVT-104', 'gcc-global-capability-summit', 'India GCC Capability Expansion Summit', 'Global Capability', 'January 14, 2027', '09:00 AM — 05:00 PM', 'Pune', 'Ritz-Carlton, Yerwada', '[{"city":"Pune","venue":"Ritz-Carlton, Yerwada","date":"2027-01-14","time":"09:00 AM — 05:00 PM"}]', 'Accelerating Global Capability Center scale, engineering talent acquisition & cross-border operating models.', '/assets/hero-leadership-fc7qIRe5.jpg', 24, 'published', 0);
