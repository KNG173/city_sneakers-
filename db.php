<?php
$conn = new mysqli("localhost", "root", "", "city_snickers_db");
if ($conn->connect_error) {
    die("Erreur : " . $conn->connect_error);
}
?>