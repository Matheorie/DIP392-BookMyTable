-- --------------------------------------------------------
-- BookMyTable - Script de test pour la base de données
-- Projet DIP392 - Système de Réservation pour Restaurant Cazingue
-- --------------------------------------------------------

-- --------------------------------------------------------
-- Suppression des tables existantes (si nécessaire)
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `tables`;
DROP TABLE IF EXISTS `time_slots`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `reservation_history`;
DROP TABLE IF EXISTS `email_templates`;

-- Suppression des procédures stockées existantes
DROP PROCEDURE IF EXISTS `find_available_table`;
DROP PROCEDURE IF EXISTS `auto_cancel_pending_reservations`;
DROP PROCEDURE IF EXISTS `mark_completed_reservations`;
DROP PROCEDURE IF EXISTS `check_availability`;

-- Suppression des fonctions existantes
DROP FUNCTION IF EXISTS `is_restaurant_open`;
DROP FUNCTION IF EXISTS `can_make_reservation`;

-- Suppression des vues existantes
DROP VIEW IF EXISTS `view_today_reservations`;
DROP VIEW IF EXISTS `view_available_tables_today`;
DROP VIEW IF EXISTS `view_reservation_stats`;
DROP VIEW IF EXISTS `view_weekly_schedule`;

-- Suppression des événements existants
DROP EVENT IF EXISTS `event_auto_cancel_pending_reservations`;
DROP EVENT IF EXISTS `event_mark_completed_reservations`;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Création des tables
-- --------------------------------------------------------

-- Table `users` - Stocke les utilisateurs administrateurs et personnel
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `tables` - Stocke les tables du restaurant
CREATE TABLE `tables` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `number` INT NOT NULL,
  `capacity` INT NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('available', 'occupied', 'reserved', 'maintenance') NOT NULL DEFAULT 'available',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number_UNIQUE` (`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `time_slots` - Stocke les créneaux horaires disponibles
CREATE TABLE `time_slots` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_lunch` TINYINT(1) NOT NULL DEFAULT 0,
  `is_dinner` TINYINT(1) NOT NULL DEFAULT 0,
  `max_capacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `start_time_UNIQUE` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `reservations` - Stocke les réservations
CREATE TABLE `reservations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `party_size` INT NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
  `table_id` INT UNSIGNED NULL DEFAULT NULL,
  `comments` TEXT NULL DEFAULT NULL,
  `confirmation_code` VARCHAR(10) NOT NULL,
  `requires_approval` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
  `cancellation_reason` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `confirmation_code_UNIQUE` (`confirmation_code`),
  KEY `idx_date_time` (`date`, `time`),
  KEY `idx_customer_email` (`customer_email`),
  KEY `idx_status` (`status`),
  KEY `fk_reservations_tables_idx` (`table_id`),
  KEY `fk_reservations_users_idx` (`created_by`),
  CONSTRAINT `fk_reservations_tables` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `reservation_history` - Stocke l'historique des changements de statut des réservations
CREATE TABLE `reservation_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reservation_id` INT UNSIGNED NOT NULL,
  `previous_status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NULL DEFAULT NULL,
  `new_status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL,
  `previous_table_id` INT UNSIGNED NULL DEFAULT NULL,
  `new_table_id` INT UNSIGNED NULL DEFAULT NULL,
  `changed_by` INT UNSIGNED NULL DEFAULT NULL,
  `change_reason` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_history_reservation_idx` (`reservation_id`),
  KEY `fk_history_previous_table_idx` (`previous_table_id`),
  KEY `fk_history_new_table_idx` (`new_table_id`),
  KEY `fk_history_user_idx` (`changed_by`),
  CONSTRAINT `fk_history_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_history_previous_table` FOREIGN KEY (`previous_table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_history_new_table` FOREIGN KEY (`new_table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `settings` - Stocke les paramètres de l'application
CREATE TABLE `settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(50) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `setting_type` ENUM('string', 'integer', 'float', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key_UNIQUE` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `email_templates` - Stocke les modèles d'emails
CREATE TABLE `email_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body_text` TEXT NOT NULL,
  `body_html` TEXT NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Création des déclencheurs
-- --------------------------------------------------------

-- Déclencheur pour enregistrer l'historique des changements de statut des réservations
DELIMITER //
CREATE TRIGGER `reservations_after_update` AFTER UPDATE ON `reservations`
FOR EACH ROW
BEGIN
  -- Vérifier si le statut ou la table a changé
  IF OLD.status <> NEW.status OR OLD.table_id <> NEW.table_id THEN
    INSERT INTO `reservation_history` (
      `reservation_id`,
      `previous_status`,
      `new_status`,
      `previous_table_id`,
      `new_table_id`,
      `changed_by`,
      `change_reason`
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      OLD.table_id,
      NEW.table_id,
      NULL, -- À remplacer par l'ID de l'utilisateur dans l'application
      NULL  -- À remplacer par une raison dans l'application
    );
  END IF;
  
  -- Mettre à jour le champ cancelled_at si le statut est passé à "cancelled"
  IF OLD.status <> 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE `reservations` SET `cancelled_at` = CURRENT_TIMESTAMP WHERE `id` = NEW.id;
  END IF;
END //
DELIMITER ;

-- --------------------------------------------------------
-- Procédures stockées
-- --------------------------------------------------------

-- Procédure pour trouver une table disponible pour une réservation
DELIMITER //
CREATE PROCEDURE `find_available_table`(
  IN p_date DATE,
  IN p_time TIME,
  IN p_party_size INT,
  IN p_duration INT -- Durée en heures
)
BEGIN
  DECLARE end_time TIME;
  
  -- Calculer l'heure de fin
  SET end_time = ADDTIME(p_time, SEC_TO_TIME(p_duration * 3600));
  
  -- Trouver les tables disponibles qui peuvent accueillir le groupe
  SELECT t.*
  FROM `tables` t
  WHERE t.capacity >= p_party_size
  AND t.status IN ('available', 'reserved')
  AND NOT EXISTS (
    SELECT 1
    FROM `reservations` r
    WHERE r.table_id = t.id
    AND r.date = p_date
    AND r.status IN ('confirmed', 'pending')
    AND (
      (r.time <= end_time AND ADDTIME(r.time, '02:00:00') > p_time)
      OR
      (r.time < end_time AND ADDTIME(r.time, '02:00:00') >= p_time)
    )
  )
  ORDER BY t.capacity ASC
  LIMIT 1;
END //
DELIMITER ;

-- Procédure pour annuler automatiquement les réservations non confirmées
DELIMITER //
CREATE PROCEDURE `auto_cancel_pending_reservations`()
BEGIN
  DECLARE cutoff_time TIMESTAMP;
  SET cutoff_time = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 24 HOUR);
  
  UPDATE `reservations`
  SET 
    `status` = 'cancelled',
    `cancelled_at` = CURRENT_TIMESTAMP,
    `cancellation_reason` = 'Annulation automatique - Non confirmée dans les 24 heures'
  WHERE 
    `status` = 'pending'
    AND `created_at` < cutoff_time
    AND `date` > CURDATE();
END //
DELIMITER ;

-- Procédure pour marquer les réservations passées comme terminées
DELIMITER //
CREATE PROCEDURE `mark_completed_reservations`()
BEGIN
  UPDATE `reservations`
  SET `status` = 'completed'
  WHERE 
    `status` IN ('confirmed', 'pending')
    AND (
      (`date` < CURDATE())
      OR 
      (`date` = CURDATE() AND `time` < TIME(DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 HOUR)))
    );
END //
DELIMITER ;

-- Procédure pour vérifier les disponibilités
DELIMITER //
CREATE PROCEDURE `check_availability`(
  IN p_date DATE,
  IN p_party_size INT
)
BEGIN
  -- Récupérer tous les créneaux horaires
  SELECT 
    ts.id,
    ts.start_time,
    ts.end_time,
    ts.is_lunch,
    ts.is_dinner,
    CASE 
      WHEN DAYOFWEEK(p_date) IN (1, 7) THEN 0 -- Weekend
      WHEN ts.is_dinner = 1 AND DAYOFWEEK(p_date) <> 5 THEN 0 -- Dîner uniquement le jeudi (jour 5)
      ELSE (
        SELECT COUNT(*) = 0
        FROM `reservations` r
        JOIN `tables` t ON r.table_id = t.id
        WHERE r.date = p_date
        AND r.status IN ('confirmed', 'pending')
        AND (
          (r.time <= ts.end_time AND ADDTIME(r.time, '02:00:00') > ts.start_time)
          OR
          (r.time < ts.end_time AND ADDTIME(r.time, '02:00:00') >= ts.start_time)
        )
        AND t.capacity >= p_party_size
      )
    END AS available
  FROM `time_slots` ts
  WHERE ts.is_active = 1
  ORDER BY ts.start_time ASC;
END //
DELIMITER ;

-- --------------------------------------------------------
-- Données initiales pour le script de test
-- --------------------------------------------------------

-- Remarque: Nous n'insérons plus l'utilisateur admin ici, car il sera créé par le script d'initialisation
-- Nous ajoutons un utilisateur staff pour les tests uniquement
-- Mot de passe: Staff123!
INSERT INTO `users` (`username`, `password`, `email`, `role`)
VALUES ('staff', '$2b$10$1XBJrUFTBYbNgRTfP1WZ2.nvTv1Q6W1DF76h/oDTQKnCQ.gQ9j9Hi', 'staff@example.com', 'staff');

-- Insérer les tables du restaurant
INSERT INTO `tables` (`number`, `capacity`, `description`, `status`) VALUES
(1, 2, 'Table près de la fenêtre', 'available'),
(2, 2, 'Table près de la fenêtre', 'available'),
(3, 4, 'Table centrale', 'available'),
(4, 4, 'Table centrale', 'available'),
(5, 4, 'Table près du bar', 'available'),
(6, 6, 'Grande table', 'available'),
(7, 6, 'Grande table près de la fenêtre', 'available'),
(8, 8, 'Table de groupe', 'available'),
(9, 2, 'Table romantique coin tranquille', 'available'),
(10, 2, 'Table haute près du bar', 'available'),
(11, 4, 'Table près de la cuisine', 'available'),
(12, 4, 'Table centrale', 'available'),
(13, 4, 'Table d\'angle', 'available'),
(14, 6, 'Table d\'angle', 'available'),
(15, 8, 'Grande table de groupe', 'available');

-- Insérer les créneaux horaires pour le déjeuner (tous les jours de la semaine)
INSERT INTO `time_slots` (`start_time`, `end_time`, `is_lunch`, `is_dinner`, `max_capacity`, `is_active`) VALUES
('12:00:00', '14:00:00', 1, 0, 60, 1),
('12:15:00', '14:15:00', 1, 0, 60, 1),
('12:30:00', '14:30:00', 1, 0, 60, 1),
('12:45:00', '14:45:00', 1, 0, 60, 1),
('13:00:00', '15:00:00', 1, 0, 60, 1),
('13:15:00', '15:15:00', 1, 0, 60, 1),
('13:30:00', '15:30:00', 1, 0, 60, 1),
('13:45:00', '15:45:00', 1, 0, 60, 1),
('14:00:00', '16:00:00', 1, 0, 60, 1);

-- Insérer les créneaux horaires pour le dîner (uniquement le jeudi)
INSERT INTO `time_slots` (`start_time`, `end_time`, `is_lunch`, `is_dinner`, `max_capacity`, `is_active`) VALUES
('19:00:00', '21:00:00', 0, 1, 60, 1),
('19:15:00', '21:15:00', 0, 1, 60, 1),
('19:30:00', '21:30:00', 0, 1, 60, 1),
('19:45:00', '21:45:00', 0, 1, 60, 1),
('20:00:00', '22:00:00', 0, 1, 60, 1),
('20:15:00', '22:15:00', 0, 1, 60, 1),
('20:30:00', '22:30:00', 0, 1, 60, 1),
('20:45:00', '22:45:00', 0, 1, 60, 1),
('21:00:00', '23:00:00', 0, 1, 60, 1),
('21:15:00', '23:15:00', 0, 1, 60, 1),
('21:30:00', '23:30:00', 0, 1, 60, 1),
('21:45:00', '23:45:00', 0, 1, 60, 1),
('22:00:00', '00:00:00', 0, 1, 60, 1),
('22:15:00', '00:15:00', 0, 1, 60, 1),
('22:30:00', '00:30:00', 0, 1, 60, 1);

-- Insérer les paramètres de l'application
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('min_advance_time', '1', 'integer', 'Temps minimum en heures pour effectuer une réservation à l\'avance'),
('max_advance_time', '720', 'integer', 'Temps maximum en heures pour effectuer une réservation à l\'avance (30 jours)'),
('min_cancellation_time', '2', 'integer', 'Temps minimum en heures pour annuler une réservation avant l\'heure prévue'),
('confirmation_required', 'true', 'boolean', 'Nécessité de confirmation manuelle par le gérant'),
('max_party_size', '20', 'integer', 'Nombre maximum de personnes par réservation'),
('service_duration', '120', 'integer', 'Durée standard d\'un service en minutes'),
('lunch_start', '12:00:00', 'string', 'Heure de début du service de déjeuner'),
('lunch_end', '15:00:00', 'string', 'Heure de fin du service de déjeuner'),
('dinner_start', '19:00:00', 'string', 'Heure de début du service de dîner'),
('dinner_end', '00:30:00', 'string', 'Heure de fin du service de dîner'),
('restaurant_name', 'Restaurant Cazingue', 'string', 'Nom du restaurant'),
('restaurant_address', '67 Rue Chaptal, 92300 Levallois-Perret', 'string', 'Adresse du restaurant'),
('restaurant_phone', '09 73 88 03 94', 'string', 'Numéro de téléphone du restaurant'),
('restaurant_email', 'contact@cazingue.fr', 'string', 'Email du restaurant'),
('restaurant_opening_days', '[1,2,3,4,5]', 'json', 'Jours d\'ouverture (1=Lundi, 7=Dimanche)'),
('restaurant_dinner_days', '[4]', 'json', 'Jours avec service de dîner (4=Jeudi)'),
('notification_email', 'notifications@cazingue.fr', 'string', 'Email pour les notifications de réservation');

-- Insérer les modèles d'emails (version simplifiée pour les tests)
INSERT INTO `email_templates` (`name`, `subject`, `body_text`, `body_html`, `description`) VALUES
('reservation_confirmation', 'Confirmation de réservation - Restaurant Cazingue', 
'Confirmation de réservation pour {customer_name}.',
'<p>Confirmation de réservation pour {customer_name}.</p>',
'Modèle d\'email pour la confirmation de réservation'),

('reservation_update', 'Modification de votre réservation - Restaurant Cazingue', 
'Modification de réservation pour {customer_name}.',
'<p>Modification de réservation pour {customer_name}.</p>',
'Modèle d\'email pour la modification de réservation'),

('reservation_cancellation', 'Annulation de votre réservation - Restaurant Cazingue', 
'Annulation de réservation pour {customer_name}.',
'<p>Annulation de réservation pour {customer_name}.</p>',
'Modèle d\'email pour l\'annulation de réservation'),

('new_reservation_notification', 'Nouvelle réservation - Restaurant Cazingue',
'Nouvelle réservation par {customer_name}.',
'<p>Nouvelle réservation par {customer_name}.</p>',
'Modèle d\'email de notification pour nouvelle réservation'),

('reservation_reminder', 'Rappel de réservation - Restaurant Cazingue', 
'Rappel de réservation pour {customer_name}.',
'<p>Rappel de réservation pour {customer_name}.</p>',
'Modèle d\'email de rappel pour réservation à venir');

-- --------------------------------------------------------
-- Exemples de réservations pour les tests
-- --------------------------------------------------------

-- Statut confirmé, aujourd'hui
INSERT INTO `reservations` (
  `customer_name`, 
  `customer_email`, 
  `customer_phone`, 
  `date`, 
  `time`, 
  `party_size`, 
  `status`, 
  `table_id`, 
  `comments`, 
  `confirmation_code`, 
  `requires_approval`
) VALUES (
  'Jean Dupont', 
  'jean.dupont@example.com', 
  '0612345678', 
  CURDATE(), 
  '12:30:00', 
  4, 
  'confirmed', 
  3, 
  'Anniversaire', 
  'ABC12345', 
  0
);

-- Statut en attente, demain
INSERT INTO `reservations` (
  `customer_name`, 
  `customer_email`, 
  `customer_phone`, 
  `date`, 
  `time`, 
  `party_size`, 
  `status`, 
  `table_id`, 
  `comments`, 
  `confirmation_code`, 
  `requires_approval`
) VALUES (
  'Marie Martin', 
  'marie.martin@example.com', 
  '0698765432', 
  DATE_ADD(CURDATE(), INTERVAL 1 DAY), 
  '13:00:00', 
  2, 
  'pending', 
  NULL, 
  'Près de la fenêtre si possible', 
  'DEF67890', 
  1
);

-- --------------------------------------------------------
-- Création des vues
-- --------------------------------------------------------

-- Vue pour les réservations du jour
CREATE OR REPLACE VIEW `view_today_reservations` AS
SELECT 
  r.id,
  r.customer_name,
  r.customer_phone,
  r.time,
  r.party_size,
  r.status,
  r.table_id,
  t.number AS table_number,
  t.capacity AS table_capacity,
  r.comments,
  r.confirmation_code
FROM `reservations` r
LEFT JOIN `tables` t ON r.table_id = t.id
WHERE r.date = CURDATE()
ORDER BY r.time ASC;

-- Vue pour les tables disponibles du jour
CREATE OR REPLACE VIEW `view_available_tables_today` AS
SELECT 
  t.id,
  t.number,
  t.capacity,
  t.status,
  t.description,
  NOT EXISTS (
    SELECT 1
    FROM `reservations` r
    WHERE r.table_id = t.id
    AND r.date = CURDATE()
    AND r.status IN ('pending', 'confirmed')
    AND TIME(NOW()) BETWEEN r.time AND ADDTIME(r.time, '02:00:00')
  ) AS is_available_now
FROM `tables` t
ORDER BY t.number ASC;

-- Vue pour les statistiques des réservations
CREATE OR REPLACE VIEW `view_reservation_stats` AS
SELECT
  DATE_FORMAT(date, '%Y-%m') AS month,
  COUNT(*) AS total_reservations,
  SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_reservations,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_reservations,
  SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) AS no_show_reservations,
  SUM(party_size) AS total_guests,
  ROUND(AVG(party_size), 1) AS avg_party_size
FROM `reservations`
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month DESC;

-- Vue pour le planning hebdomadaire
CREATE OR REPLACE VIEW `view_weekly_schedule` AS
SELECT
  r.date,
  DAYNAME(r.date) AS day_of_week,
  r.time,
  COUNT(*) AS reservation_count,
  SUM(r.party_size) AS total_guests,
  GROUP_CONCAT(DISTINCT t.number ORDER BY t.number ASC SEPARATOR ', ') AS tables_reserved
FROM `reservations` r
LEFT JOIN `tables` t ON r.table_id = t.id
WHERE r.date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
AND r.status IN ('pending', 'confirmed')
GROUP BY r.date, r.time
ORDER BY r.date, r.time;

-- --------------------------------------------------------
-- Événements programmés
-- --------------------------------------------------------

-- Activer les événements programmés
SET GLOBAL event_scheduler = ON;

-- Événement pour annuler automatiquement les réservations non confirmées après 24 heures
DELIMITER //
CREATE EVENT IF NOT EXISTS `event_auto_cancel_pending_reservations`
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  CALL auto_cancel_pending_reservations();
END //
DELIMITER ;

-- Événement pour marquer les réservations passées comme terminées
DELIMITER //
CREATE EVENT IF NOT EXISTS `event_mark_completed_reservations`
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  CALL mark_completed_reservations();
END //
DELIMITER ;

-- --------------------------------------------------------
-- Fonctions
-- --------------------------------------------------------

-- Fonction pour obtenir le statut du restaurant à un moment donné
DELIMITER //
CREATE FUNCTION `is_restaurant_open`(check_date DATE, check_time TIME) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  DECLARE day_of_week INT;
  DECLARE is_open BOOLEAN DEFAULT FALSE;
  
  -- Obtenir le jour de la semaine (1 = Dimanche, 2 = Lundi, ..., 7 = Samedi)
  SET day_of_week = DAYOFWEEK(check_date);
  
  -- Vérifier si c'est un jour d'ouverture (2-6 = Lundi-Vendredi)
  IF day_of_week BETWEEN 2 AND 6 THEN
    -- Vérifier si c'est pendant les heures d'ouverture
    -- Déjeuner: 12h00-15h00 (Lun-Ven)
    IF check_time BETWEEN '12:00:00' AND '15:00:00' THEN
      SET is_open = TRUE;
    -- Dîner: 19h00-00h30 (uniquement le Jeudi - jour 5)
    ELSEIF day_of_week = 5 AND check_time BETWEEN '19:00:00' AND '00:30:00' THEN
      SET is_open = TRUE;
    END IF;
  END IF;
  
  RETURN is_open;
END //
DELIMITER ;

-- Fonction pour vérifier si une réservation peut être faite
DELIMITER //
CREATE FUNCTION `can_make_reservation`(
  check_date DATE, 
  check_time TIME, 
  party_size INT
) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  DECLARE time_diff FLOAT;
  DECLARE min_advance_time INT;
  DECLARE max_advance_time INT;
  DECLARE max_party_size INT;
  DECLARE is_open BOOLEAN;
  
  -- Récupérer les paramètres des settings
  SELECT CAST(setting_value AS SIGNED) INTO min_advance_time FROM settings WHERE setting_key = 'min_advance_time';
  SELECT CAST(setting_value AS SIGNED) INTO max_advance_time FROM settings WHERE setting_key = 'max_advance_time';
SELECT CAST(setting_value AS SIGNED) INTO max_party_size FROM settings WHERE setting_key = 'max_party_size';
  
  -- Vérifier si le restaurant est ouvert à cette date et heure
  SET is_open = is_restaurant_open(check_date, check_time);
  
  IF is_open = FALSE THEN
    RETURN FALSE;
  END IF;
  
  -- Calculer la différence en heures entre maintenant et la date/heure de réservation
  SET time_diff = TIMESTAMPDIFF(HOUR, NOW(), CONCAT(check_date, ' ', check_time));
  
  -- Vérifier les conditions
  IF time_diff < min_advance_time THEN
    RETURN FALSE; -- Trop proche dans le temps
  ELSEIF time_diff > max_advance_time THEN
    RETURN FALSE; -- Trop loin dans le temps
  ELSEIF party_size > max_party_size THEN
    RETURN FALSE; -- Groupe trop grand
  END IF;
  
  RETURN TRUE;
END //
DELIMITER ;

-- --------------------------------------------------------
-- Index supplémentaires pour les performances
-- --------------------------------------------------------

-- Optimiser les requêtes sur les réservations par date et statut
CREATE INDEX `idx_reservations_date_status` ON `reservations` (`date`, `status`);

-- Optimiser les recherches par nom de client
CREATE INDEX `idx_reservations_customer_name` ON `reservations` (`customer_name`);

-- Optimiser les jointures avec les tables
CREATE INDEX `idx_reservations_table_id` ON `reservations` (`table_id`);

-- --------------------------------------------------------
-- Fin du script
-- --------------------------------------------------------

-- Afficher des informations de confirmation
SELECT 'Installation de la base de données BookMyTable (version de test) terminée avec succès!' AS 'Status';
SELECT 'Remarque: L\'utilisateur administrateur sera créé par le script d\'initialisation de l\'application.' AS 'Important';