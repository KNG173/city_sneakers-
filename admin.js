const API_URL = "http://172.21.52.205:5000";

async function ajouterProduitOracle(e) {
    if (e) e.preventDefault();
    
    // Récupération automatique des IDs de ton formulaire
    const nom = document.getElementById("nom").value;
    const prix = document.getElementById("prix").value;
    const image = document.getElementById("image_url").value || "sneaker.jpg";

    try {
        const res = await fetch(`${API_URL}/api/add_product`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 2026"
            },
            body: JSON.stringify({ nom, prix: parseFloat(prix), image })
        });

        if (res.ok) {
            alert("✅ RÉUSSI ! Le produit est dans Oracle.");
            location.reload(); // Rafraîchit pour voir le résultat
        } else {
            const err = await res.json();
            alert("❌ ERREUR : " + err.message);
        }
    } catch (error) {
        alert("❌ SERVEUR INJOIGNABLE. Vérifie Ubuntu.");
    }
}

// Branchement automatique au bouton
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formAjoutProduit");
    if (form) form.addEventListener("submit", ajouterProduitOracle);
});