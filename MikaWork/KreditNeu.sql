SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

DROP TRIGGER IF EXISTS tr_before_insert_transaktionen;
DROP TRIGGER IF EXISTS tr_after_insert_transaktionen;

DROP TABLE IF EXISTS `transaktionen`;
DROP TABLE IF EXISTS `externe_kontakte`;
DROP TABLE IF EXISTS `konten`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `uid` INT NOT NULL AUTO_INCREMENT,
  `forename` VARCHAR(20) NOT NULL,
  `lastname` VARCHAR(30) NOT NULL,
  `bundesland` VARCHAR(30) NOT NULL,
  `birth` DATE NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `konten` (
  `kid` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `balance` DECIMAL(11,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`kid`),
  KEY `idx_konten_uid` (`uid`),
  CONSTRAINT `fk_user_konten` FOREIGN KEY (`uid`) REFERENCES `user`(`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `externe_kontakte` (
  `kontaktid` INT NOT NULL AUTO_INCREMENT,
  `uid` INT NOT NULL,
  `iban` VARCHAR(34),
  `name` VARCHAR(50),
  `bank` VARCHAR(50),
  PRIMARY KEY (`kontaktid`),
  KEY `idx_externe_uid` (`uid`),
  CONSTRAINT `fk_user_externe_kontakte` FOREIGN KEY (`uid`) REFERENCES `user`(`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `transaktionen` (
  `tid` INT NOT NULL AUTO_INCREMENT,
  `from_kid` INT NULL,
  `from_extern` INT NULL,
  `to_kid` INT NULL,
  `to_extern` INT NULL,
  `trans_value` DECIMAL(11,2) NOT NULL,
  `trans_date` DATE NOT NULL,
  `trans_message` VARCHAR(255),
  PRIMARY KEY (`tid`),
  KEY `idx_from_kid` (`from_kid`),
  KEY `idx_to_kid` (`to_kid`),
  KEY `idx_from_extern` (`from_extern`),
  KEY `idx_to_extern` (`to_extern`),
  CONSTRAINT `fk_trans_sender_konto` FOREIGN KEY (`from_kid`) REFERENCES `konten`(`kid`) ON DELETE SET NULL,
  CONSTRAINT `fk_trans_receiver_konto` FOREIGN KEY (`to_kid`) REFERENCES `konten`(`kid`) ON DELETE SET NULL,
  CONSTRAINT `fk_trans_from_extern` FOREIGN KEY (`from_extern`) REFERENCES `externe_kontakte`(`kontaktid`) ON DELETE SET NULL,
  CONSTRAINT `fk_trans_to_extern` FOREIGN KEY (`to_extern`) REFERENCES `externe_kontakte`(`kontaktid`) ON DELETE SET NULL,
  CONSTRAINT `chk_source` CHECK (
    (from_kid IS NOT NULL AND from_extern IS NULL)
    OR (from_kid IS NULL AND from_extern IS NOT NULL)
  ),
  CONSTRAINT `chk_target` CHECK (
    (to_kid IS NOT NULL AND to_extern IS NULL)
    OR (to_kid IS NULL AND to_extern IS NOT NULL)
  ),
  CONSTRAINT `chk_not_same_internal` CHECK (
    NOT (from_kid IS NOT NULL AND to_kid IS NOT NULL AND from_kid = to_kid)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER $$

CREATE TRIGGER tr_before_insert_transaktionen
BEFORE INSERT ON `transaktionen`
FOR EACH ROW
BEGIN
  DECLARE from_balance DECIMAL(11,2);

  IF NEW.trans_value <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ungültiger Betrag';
  END IF;

  IF (NEW.from_kid IS NULL AND NEW.from_extern IS NULL) OR (NEW.to_kid IS NULL AND NEW.to_extern IS NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quelle und Ziel müssen gesetzt sein';
  END IF;

  IF (NEW.from_kid IS NOT NULL AND NEW.from_extern IS NOT NULL) OR (NEW.to_kid IS NOT NULL AND NEW.to_extern IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quelle/Ziel: entweder intern oder extern, nicht beides';
  END IF;

  IF NEW.from_kid IS NOT NULL THEN
    SELECT balance INTO from_balance
      FROM `konten`
      WHERE kid = NEW.from_kid
      FOR UPDATE;

    IF from_balance IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Senderkonto nicht gefunden';
    END IF;

    IF from_balance < NEW.trans_value THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unzureichender Kontostand';
    END IF;
  END IF;

  IF NEW.to_kid IS NOT NULL THEN
    SELECT balance INTO from_balance
      FROM `konten`
      WHERE kid = NEW.to_kid
      FOR UPDATE;

    IF from_balance IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empfängerkonto nicht gefunden';
    END IF;
  END IF;
END$$

CREATE TRIGGER tr_after_insert_transaktionen
AFTER INSERT ON `transaktionen`
FOR EACH ROW
BEGIN
  IF NEW.from_kid IS NOT NULL THEN
    UPDATE `konten` SET balance = balance - NEW.trans_value WHERE kid = NEW.from_kid;
  END IF;

  IF NEW.to_kid IS NOT NULL THEN
    UPDATE `konten` SET balance = balance + NEW.trans_value WHERE kid = NEW.to_kid;
  END IF;
END$$

DELIMITER ;

-- Testdaten
INSERT INTO `user` (`uid`,`forename`,`lastname`,`bundesland`,`birth`,`username`,`password`) VALUES
(1, 'Mika-Rae',    'Schulte', 'NRW',  STR_TO_DATE('18.11.1999', '%d.%m.%Y'), 'DerEchteMika',        'SuperGeheimesPasswort123!'),
(2, 'Markus',      'Soeder',  'Bayern',STR_TO_DATE('07.01.1937', '%d.%m.%Y'), 'LEBERWURSCHT4LIFE',   'MeinPasswortIstSicher'),
(3, 'Dominik',     'Beneke',  'Hessen',STR_TO_DATE('05.03.1992', '%d.%m.%Y'), 'dominikb',            'DomPass#2025'),
(4, 'Marius',      'Sand',    'Sachsen',STR_TO_DATE('22.10.1995', '%d.%m.%Y'), 'marius_sand',         'M4rius!'),
(5, 'Anna',        'Müller',  'Hamburg',STR_TO_DATE('12.06.1988', '%d.%m.%Y'), 'anna.mueller',        'AnnaPwd88');

INSERT INTO `konten` (`kid`,`uid`,`balance`) VALUES
(101, 1, 17.35),
(102, 2, 83932761.73),
(103, 3, 2500.00),
(104, 4, 3500.00),
(105, 5, 12345.67);

INSERT INTO `externe_kontakte` (`kontaktid`,`uid`,`iban`,`name`,`bank`) VALUES
(201, 1, 'DE89370400440532013000', 'LIDL', 'Sparkasse'),
(202, 2, 'DE75512108001245126199', 'Kunze GmbH&CoKG',   'Commerzbank'),
(203, 3, 'DE21500105179312345678', 'Ralf Schuhmacher', 'Deutsche Bank'),
(204, 4, 'DE44200700100234567890', 'Kim Jong Un',  'Postbank'),
(205, 5, 'DE98100500001234567890', 'Daniel',  'ING'),
(206, 5, 'DE98100500001234567891', 'Disney+',  'ING'),
(207, 5, 'DE98100500001234567892', 'Spotify',  'ING');

-- beim eingeben die NULL werte beachten
INSERT INTO `transaktionen` (`tid`,`from_kid`,`from_extern`,`to_kid`,`to_extern`,`trans_value`,`trans_date`,`trans_message`) VALUES
(1001, 101, NULL, 102, NULL, 9.35,  STR_TO_DATE('15.08.2025','%d.%m.%Y'), 'zwangsabgabe fuer das Koenigreich Bayern.'),
(1002, 103, NULL, 105, NULL, 150.00, STR_TO_DATE('01.03.2025','%d.%m.%Y'), 'Miete'),
(1003, 105, NULL, 101, NULL, 50.67, STR_TO_DATE('10.04.2025','%d.%m.%Y'), 'Rückzahlung'),
(1004, 102, NULL, 103, NULL, 1.00,   STR_TO_DATE('20.05.2025','%d.%m.%Y'), 'Überweisung an Dominik'),
(1005, 104, NULL, 105, NULL, 10.00,  STR_TO_DATE('02.07.2025','%d.%m.%Y'), 'Kleiner Betrag'),
(1101, NULL, 202, 101, NULL, 2000.00, STR_TO_DATE('02.09.2025','%d.%m.%Y'), 'Gehalt September 2025'),
(1102, 101, NULL, NULL, 206, 7.99,    STR_TO_DATE('13.09.2025','%d.%m.%Y'), 'Disney+ Abo September 2025'),
(1103, 101, NULL, NULL, 207, 12.99,   STR_TO_DATE('23.09.2025','%d.%m.%Y'), 'Spotify Abo September 2025'),
(1104, 101, NULL, NULL, 201, 5.45,    STR_TO_DATE('05.09.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1105, 101, NULL, NULL, 201, 24.90,   STR_TO_DATE('12.09.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1106, 101, NULL, NULL, 201, 9.30,    STR_TO_DATE('28.09.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1107, NULL, 202, 101, NULL, 2000.00, STR_TO_DATE('02.10.2025','%d.%m.%Y'), 'Gehalt Oktober 2025'),
(1108, 101, NULL, NULL, 206, 7.99,    STR_TO_DATE('13.10.2025','%d.%m.%Y'), 'Disney+ Abo Oktober 2025'),
(1109, 101, NULL, NULL, 207, 12.99,   STR_TO_DATE('23.10.2025','%d.%m.%Y'), 'Spotify Abo Oktober 2025'),
(1110, 101, NULL, NULL, 201, 6.20,    STR_TO_DATE('04.10.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1111, 101, NULL, NULL, 201, 18.75,   STR_TO_DATE('15.10.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1112, 101, NULL, NULL, 201, 11.40,   STR_TO_DATE('27.10.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1113, NULL, 202, 101, NULL, 2000.00, STR_TO_DATE('02.11.2025','%d.%m.%Y'), 'Gehalt November 2025'),
(1114, 101, NULL, NULL, 206, 7.99,    STR_TO_DATE('13.11.2025','%d.%m.%Y'), 'Disney+ Abo November 2025'),
(1115, 101, NULL, NULL, 207, 12.99,   STR_TO_DATE('23.11.2025','%d.%m.%Y'), 'Spotify Abo November 2025'),
(1116, 101, NULL, NULL, 201, 8.50,    STR_TO_DATE('03.11.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1117, 101, NULL, NULL, 201, 27.30,   STR_TO_DATE('18.11.2025','%d.%m.%Y'), 'Lidl Einkauf'),
(1118, 101, NULL, NULL, 201, 15.60,   STR_TO_DATE('30.11.2025','%d.%m.%Y'), 'Lidl Einkauf');