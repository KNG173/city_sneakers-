<?php
include "db.php";

$message = "";

// Si le formulaire est envoyé
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $_POST['nom'];
    $prix = $_POST['prix'];
    $cat = $_POST['categorie'];
    $desc = $_POST['description'];
    
    // On récupère le nom du fichier image
    $image = $_FILES['image']['name'];
    $target = "./" . basename($image);

    // On insère dans la base de données
    $sql = "INSERT INTO produits (nom, prix, image, categorie, description) VALUES ('$nom', '$prix', '$image', '$cat', '$desc')";
    
    if ($conn->query($sql) === TRUE) {
        // On déplace l'image physiquement dans le dossier
        move_uploaded_file($_FILES['image']['tmp_name'], $target);
        $message = "<p style='color:green;'>✅ Produit ajouté avec succès !</p>";
    } else {
        $message = "<p style='color:red;'>❌ Erreur : " . $conn->error . "</p>";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Admin - Ajouter un produit</title>
    <style>
        body { font-family: sans-serif; background: #050505; color: white; display: flex; justify-content: center; padding: 50px; }
        .form-card { background: #111; padding: 25px; border-radius: 12px; border: 1px solid #222; width: 400px; }
        input, select, textarea { width: 100%; padding: 10px; margin: 10px 0; background: #222; border: 1px solid #333; color: white; border-radius: 5px; }
        button { width: 100%; padding: 12px; background: #FF3B30; border: none; color: white; font-weight: bold; cursor: pointer; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="form-card">
        <h2>Ajouter une chaussure</h2>
        <?php echo $message; ?>
        <form method="POST" enctype="multipart/form-data">
            <input type="text" name="nom" placeholder="Nom de la chaussure" required>
            <input type="number" step="0.01" name="prix" placeholder="Prix ($)" required>
            <select name="categorie">
                <option value="soulier">Soulier</option>
                <option value="jordan">Jordan</option>
                <option value="sport">Sport</option>
                <option value="babouche">Babouche</option>
                <option value="sandale">Sandale</option>
            </select>
            <textarea name="description" placeholder="Description courte"></textarea>
            <label>Photo du produit :</label>
            <input type="file" name="image" accept="image/*" required>
            <button type="submit">PUBLIER SUR LE SITE</button>
        </form>
        <br>
        <a href="index.html" style="color: gray; text-decoration: none; font-size: 0.8rem;">← Retour au site</a>
    </div>
</body>
</html>