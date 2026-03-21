-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 21 mars 2026 à 22:07
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `city_snickers_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `prix`, `image`, `description`, `categorie`) VALUES
(1, 'Soulier - John Foster', 20.00, 'Crampon1.jpg', 'Collection Premium', 'soulier'),
(2, 'Soulier - College', 20.00, 'Crampon2.jpg', 'Style Classique', 'soulier'),
(3, 'Soulier - Perpette', 20.00, 'Crampon3.jpg', '?l?gance', 'soulier'),
(4, 'Jordan 1 Retro', 20.00, 'Jordan.jpg', 'Iconic Style', 'jordan'),
(5, 'Jordan 2 Retro', 20.00, 'Jordan1.jpg', 'Premium', 'jordan'),
(6, 'Crampon Nike 1', 15.00, 'Crampon1.jpg', 'Performance', 'sport'),
(7, 'Crampon Nike 2', 15.00, 'Crampon2.jpg', 'Terrain', 'sport'),
(8, 'Crocs 1', 10.00, 'Crampon1.jpg', 'Confort', 'babouche'),
(9, 'Sandale 1', 10.00, 'Crampon1.jpg', '?t?', 'sandale');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
