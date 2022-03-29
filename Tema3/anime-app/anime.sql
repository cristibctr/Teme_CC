-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 27, 2022 at 06:23 PM
-- Server version: 10.4.19-MariaDB
-- PHP Version: 8.0.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `anime-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `anime`
--

CREATE TABLE `anime` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `anime`
--

INSERT INTO `anime` (`id`, `name`) VALUES
(1, 'Tokyo Ghoul :re'),
(2, 'Tokyo Ghoul'),
(3, 'Attack on Titan\r\n');

-- --------------------------------------------------------

--
-- Table structure for table `anime_entry`
--

CREATE TABLE `anime_entry` (
  `id` int(11) NOT NULL,
  `episodesWatched` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `animeId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `anime_entry`
--

INSERT INTO `anime_entry` (`id`, `episodesWatched`, `status`, `userId`, `animeId`) VALUES
(1, 0, 'Plan to watc', 10, 1),
(2, 3, 'On Hold', 1, 1),
(3, 0, 'Plan to watch', 10, 1),
(4, 0, 'Plan to watch', 10, 3),
(5, 0, 'Plan to watch', 10, 2);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`) VALUES
(1, 'Ionel'),
(4, 'Johnson'),
(5, 'Doe'),
(6, 'Marilyn'),
(10, 'Manson'),
(11, 'Hehesag');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `anime`
--
ALTER TABLE `anime`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `anime_entry`
--
ALTER TABLE `anime_entry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_b606287a0e22848c6eaffe24e50` (`userId`),
  ADD KEY `FK_7dd02419f5fefa6d28b2ce5da97` (`animeId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `anime`
--
ALTER TABLE `anime`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `anime_entry`
--
ALTER TABLE `anime_entry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `anime_entry`
--
ALTER TABLE `anime_entry`
  ADD CONSTRAINT `FK_7dd02419f5fefa6d28b2ce5da97` FOREIGN KEY (`animeId`) REFERENCES `anime` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_b606287a0e22848c6eaffe24e50` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
