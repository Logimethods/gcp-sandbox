-- --------------------------------------------------------
-- Host:                         35.245.9.72
-- Server version:               5.7.14-google-log - (Google)
-- Server OS:                    Linux
-- HeidiSQL Version:             10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for timesheets
CREATE DATABASE IF NOT EXISTS `timesheets` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `timesheets`;

-- Dumping structure for table timesheets.status
CREATE TABLE IF NOT EXISTS `status` (
  `id` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `org` varchar(50) NOT NULL,
  `month_check_date` date DEFAULT NULL,
  `week_check_date` date DEFAULT NULL,
  `month_status` enum('Y','N','N/A') NOT NULL DEFAULT 'N/A',
  `week_status` enum('Y','N','N/A') NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table timesheets.status: ~0 rows (approximately)
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
/*!40000 ALTER TABLE `status` ENABLE KEYS */;

-- Dumping structure for table timesheets.token
CREATE TABLE IF NOT EXISTS `token` (
  `token` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table timesheets.token: ~1 rows (approximately)
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
INSERT INTO `token` (`token`) VALUES
	('{"token": {"scope": "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/spreadsheets", "token_type": "Bearer", "expiry_date": 1582131480855, "access_token": "ya29.a0Adw1xeV5Z2NQiUoxCyJs59aVHPd1WQDLzAHrR9VL0R8NCYyG8jKyJ-LXg35SVUdLo8X_I7YMlk-b7knIh1zlJUcPLyNAkacb4iHIw_MEySYXSJNkjkTfWM5jSRSeg4Pm1dyljnC2vEOVAefKYoKiyXm6BYYqml8THJiD", "refresh_token": "1//05a-wvXO0uF2eCgYIARAAGAUSNwF-L9Irj6l6Cm90Epwi0YOutZFrdDXy_fzPD5DUEWCmhVQ5fWSQdDfMSIwcn1zr4iBlXGg3Nkw"}, "client_id": "854871234769-8b7nmbga22t5ni7kernkon5ft5gui7un.apps.googleusercontent.com", "redirectUri": "urn:ietf:wg:oauth:2.0:oob", "client_secret": "4CIY-CtlxKTPWXfXAVK1L6CR"}');
/*!40000 ALTER TABLE `token` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
