-- =====================================================================
-- GATEKARU ENTERPRISE SMART GATEKEEPER ERP - PRODUCTION DATABASE SCHEMA
-- Created by JobsKaru Technology (support@jobskaru.com)
-- Purpose: Complete, clean schema tables & seeds for production deployment.
-- =====================================================================

-- -----------------------------------------------------
-- Table structure for table `settings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(50) NOT NULL,
  `promotionalAdsEnabled` TINYINT(1) DEFAULT 1,
  `activeThemeOverride` VARCHAR(255) DEFAULT '',
  `simulatedDate` VARCHAR(255) DEFAULT '',
  `smsGatewayUrl` VARCHAR(500) DEFAULT '',
  `smsApiKey` VARCHAR(500) DEFAULT '',
  `smsSenderId` VARCHAR(50) DEFAULT '',
  `smsRoute` VARCHAR(50) DEFAULT '',
  `smsActive` TINYINT(1) DEFAULT 0,
  `activeSmsProviderId` VARCHAR(50) DEFAULT 'fast2sms',
  `smsProviders` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(255) NOT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `vehicleNo` VARCHAR(255) DEFAULT NULL,
  `shift` VARCHAR(255) DEFAULT NULL,
  `gate` VARCHAR(255) DEFAULT NULL,
  `idCard` VARCHAR(255) DEFAULT NULL,
  `designation` VARCHAR(255) DEFAULT NULL,
  `committee` VARCHAR(255) DEFAULT NULL,
  `organization` VARCHAR(255) DEFAULT NULL,
  `registeredAt` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `visitors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `purpose` VARCHAR(255) DEFAULT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `hostName` VARCHAR(255) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `vehicleNumber` VARCHAR(255) DEFAULT NULL,
  `passcode` VARCHAR(255) DEFAULT NULL,
  `qrCode` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `requestedAt` VARCHAR(255) DEFAULT NULL,
  `checkedInAt` VARCHAR(255) DEFAULT NULL,
  `checkedOutAt` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `maintenance`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `maintenance` (
  `id` VARCHAR(255) NOT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `amount` DOUBLE DEFAULT 0.0,
  `dueDate` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `paidAt` VARCHAR(255) DEFAULT NULL,
  `transactionId` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `complaints`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` VARCHAR(255) NOT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `residentName` VARCHAR(255) DEFAULT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `createdAt` VARCHAR(255) DEFAULT NULL,
  `assignedTo` VARCHAR(255) DEFAULT NULL,
  `updates` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `notices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `notices` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `content` TEXT DEFAULT NULL,
  `date` VARCHAR(255) DEFAULT NULL,
  `author` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `chats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `chats` (
  `id` VARCHAR(255) NOT NULL,
  `sender` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(255) DEFAULT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `timestamp` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `amenities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `amenities` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `capacity` INT DEFAULT 0,
  `costPerHour` INT DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `amenityBookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `amenityBookings` (
  `id` VARCHAR(255) NOT NULL,
  `amenityId` VARCHAR(255) DEFAULT NULL,
  `amenityName` VARCHAR(255) DEFAULT NULL,
  `residentName` VARCHAR(255) DEFAULT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `date` VARCHAR(255) DEFAULT NULL,
  `timeSlot` VARCHAR(255) DEFAULT NULL,
  `cost` INT DEFAULT 0,
  `status` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `staff`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `rating` DOUBLE DEFAULT 0.0,
  `flats` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `checkedInAt` VARCHAR(255) DEFAULT NULL,
  `checkedOutAt` VARCHAR(255) DEFAULT NULL,
  `code` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `parking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `parking` (
  `id` VARCHAR(255) NOT NULL,
  `slotNumber` VARCHAR(255) DEFAULT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `owner` VARCHAR(255) DEFAULT NULL,
  `vehicleNumber` VARCHAR(255) DEFAULT NULL,
  `vehicleType` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `polls`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `polls` (
  `id` VARCHAR(255) NOT NULL,
  `question` VARCHAR(255) DEFAULT NULL,
  `options` TEXT DEFAULT NULL,
  `votedUsers` TEXT DEFAULT NULL,
  `totalVotes` INT DEFAULT 0,
  `endsAt` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `guardAlerts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `guardAlerts` (
  `id` VARCHAR(255) NOT NULL,
  `sender` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `timestamp` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `superAdminPlans`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `superAdminPlans` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `price` DOUBLE DEFAULT 0.0,
  `period` VARCHAR(255) DEFAULT NULL,
  `societies` INT DEFAULT 0,
  `features` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `approvals`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `approvals` (
  `id` VARCHAR(255) NOT NULL,
  `visitorName` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `flat` VARCHAR(255) DEFAULT NULL,
  `hostName` VARCHAR(255) DEFAULT NULL,
  `vehicleNumber` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `timestamp` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `family`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `family` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `relationship` VARCHAR(255) DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `accessGranted` TINYINT(1) DEFAULT 0,
  `flat` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `documents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `uploadDate` VARCHAR(255) DEFAULT NULL,
  `size` VARCHAR(255) DEFAULT NULL,
  `url` VARCHAR(255) DEFAULT NULL,
  `privateToResident` TINYINT(1) DEFAULT 0,
  `flat` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `coupons`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `code` VARCHAR(255) DEFAULT NULL,
  `discount` VARCHAR(255) DEFAULT NULL,
  `validUntil` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `views` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `vehicles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicles` (
  `plate` VARCHAR(255) NOT NULL,
  `type` VARCHAR(255) DEFAULT NULL,
  `ownerName` VARCHAR(255) DEFAULT NULL,
  `flatNo VARCHAR` VARCHAR(255) DEFAULT NULL,
  `checkInTime` VARCHAR(255) DEFAULT NULL,
  `checkedIn` TINYINT(1) DEFAULT 0,
  `stickerNo` VARCHAR(255) DEFAULT NULL,
  `rfidTag` VARCHAR(255) DEFAULT NULL,
  `tagActive` TINYINT(1) DEFAULT 0,
  `flat` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table structure for table `gateLogs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gateLogs` (
  `id` VARCHAR(255) NOT NULL,
  `direction` VARCHAR(255) DEFAULT NULL,
  `plate` VARCHAR(255) DEFAULT NULL,
  `timestamp` VARCHAR(255) DEFAULT NULL,
  `gate` VARCHAR(255) DEFAULT NULL,
  `success` TINYINT(1) DEFAULT 1,
  `photoUrl` VARCHAR(255) DEFAULT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `details` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
--                   SECURE SEED DATA INSERTS
-- =====================================================================

-- 1. Initial System Configuration Settings
INSERT INTO `settings` 
  (`id`, `promotionalAdsEnabled`, `activeThemeOverride`, `simulatedDate`, `smsGatewayUrl`, `smsApiKey`, `smsSenderId`, `smsRoute`, `smsActive`, `activeSmsProviderId`, `smsProviders`)
VALUES 
  ('main', 1, '', '', 'https://www.fast2sms.com/dev/bulkV2', 'VQMRfN6dxzBRYdTc3JNvfjSaPhu92h1uL0l2CSRVxIFXdGcxIODWsKXaAw8f', 'gatekaru', 'otp', 1, 'fast2sms', '[]');

-- 2. Built-in Super Admin Accounts (rajesh & developer)
INSERT INTO `users`
  (`id`, `name`, `phone`, `email`, `role`, `flat`, `type`, `vehicleNo`, `shift`, `gate`, `idCard`, `designation`, `committee`, `organization`, `registeredAt`)
VALUES
  ('u5', 'Rajesh GateKaru', '+91 99999 88888', 'super@gatekaru.com', 'super_admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'GateKaru Corporate', '2026-07-10T00:00:00Z'),
  ('u6', 'GateKaru Developer', '+91 99999 12345', 'jaiganeshdp@gmail.com', 'super_admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'GateKaru Corporate', '2026-07-10T00:00:00Z');

-- 3. Initial Corporate Plans
INSERT INTO `superAdminPlans`
  (`id`, `name`, `price`, `period`, `societies`, `features`)
VALUES
  ('pln1', 'GateKaru Essential', 1500.0, 'Monthly', 12, '["Visitor Pre-Approval", "Notice Board", "SOS Alerts"]'),
  ('pln2', 'GateKaru Premium Enterprise', 3500.0, 'Monthly', 38, '["All Essentials", "Society Accounting & ERP", "Maintenance Payments", "AI Assistants Suite"]');

-- 4. Initial Amenities (Structural Configuration)
INSERT INTO `amenities`
  (`id`, `name`, `capacity`, `costPerHour`, `description`)
VALUES
  ('a1', 'Clubhouse / Community Hall', 100, 500, 'Fully air-conditioned hall with seating and sound system.'),
  ('a2', 'Gymnasium', 15, 0, 'State-of-the-art weights and cardio equipment.'),
  ('a3', 'Badminton Court', 4, 100, 'Indoor wooden court. Slots require pre-booking.');
