// ==========================================
// 1. CONFIGURATION SUPABASE
// ==========================================
const SUPABASE_URL = 'https://tusyxrkyuvmaiofvditd.supabase.co';
const SUPABASE_KEY = 'TON_CODE_ANON_ICI'; // ⚠️ EFFACE CE TEXTE ET COLLE TA CLÉ API PUBLIQUE ICI
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let allItems = [];
let cart = JSON.parse(localStorage.getItem('city_sneakers_cart')) || [];

// ==========================================
// 3. CHARGEMENT DES PRODUITS (Depuis Supabase)
// ==========================================
async function chargerProduits() {
  const { data, error } = await _supabase
    .from('produits')
    .select('*');

  if (error) {
    console.error("Erreur lors du chargement Supabase:", error);
    return;
  }

  // On adapte les colonnes de ton tableau Supabase pour le code
  allItems = data.map(p => ({
    id: p.identifiant,
    name: p.nom,
    price: p.prix,
    img: p.image,
    cat: p.categorie
  }));

  renderGrid(allItems);
}

// ==========================================
// 4. AFFICHAGE DE LA GRILLE DE CHAUSSURES
// ==========================================
function renderGrid(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" style="width:100%; border-radius:8px;">
      <h3>${p.name}</h3>
      <p class="price">${p.price}$</p>
      <button onclick="openModal('${p.id}')">Acheter</button>
    `;
    grid.appendChild(card);
  });
}

// ==========================================
// 5. GESTION DU PANIER
// ==========================================
function saveCartToStorage() {
  localStorage.setItem('city_sneakers_cart', JSON.stringify(cart));
}

function addToCart(id, name, price, img, sz) {
  const existing = cart.find(i => i.id === id && i.sz === sz);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, sz, qty: 1 });
  }
  saveCartToStorage();
  renderCart();
  closeModal();
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const cartCount = document.getElementById('cartCount');
  if (!cartList) return;

  cartList.innerHTML = '';
  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    count += item.qty;
    const li = document.createElement('div');
    li.className = 'cart-item';
    li.innerHTML = `
      <span>${item.name} (Taille: ${item.sz}) x${item.qty}</span>
      <span>${(item.price * item.qty).toFixed(2)}$</span>
      <button onclick="removeFromCart(${index})">X</button>
    `;
    cartList.appendChild(li);
  });

  if (cartCount) cartCount.innerText = count;
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.innerText = total.toFixed(2);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  renderCart();
}

// ==========================================
// 6. FENÊTRE MODALE (Détails du produit)
// ==========================================
let currentProductId = null;

function openModal(id) {
  const p = allItems.find(i => i.id == id);
  if (!p) return;
  currentProductId = id;
  
  const titleEl = document.getElementById('modalTitle');
  const imgEl = document.getElementById('modalImg');
  const priceEl = document.getElementById('modalPrice');
  const modalEl = document.getElementById('productModal');

  if(titleEl) titleEl.innerText = p.name;
  if(imgEl) imgEl.src = p.img;
  if(priceEl) priceEl.innerText = p.price + "$";
  if(modalEl) modalEl.style.display = 'flex';
}

function closeModal() {
  const modalEl = document.getElementById('productModal');
  if(modalEl) modalEl.style.display = 'none';
}

function confirmAdd() {
  const p = allItems.find(i => i.id == currentProductId);
  const sizeSelect = document.getElementById('sizeSelect');
  const sz = sizeSelect ? sizeSelect.value : 'Standard';
  
  if (p) addToCart(p.id, p.name, p.price, p.img, sz);
}

// ==========================================
// 7. FINALISATION DE LA COMMANDE (WhatsApp)
// ==========================================
function finaliserCommande() {
  const nomClientEl = document.getElementById('nomClient');
  const phoneClientEl = document.getElementById('phoneClient');
  const communeSelect = document.getElementById('communeSelect');

  const nomClient = nomClientEl ? nomClientEl.value : '';
  const phoneClient = phoneClientEl ? phoneClientEl.value : '';
  const commune = communeSelect ? communeSelect.value : '';

  if (!nomClient || !phoneClient) {
    alert("Merci de compléter ton nom et ton numéro de téléphone !");
    return;
  }

  if (cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }

  let totalPrix = 0;
  let texteArticles = cart.map(i => {
    totalPrix += i.price * i.qty;
    return `${i.name} (Taille:${i.sz}) x${i.qty}`;
  }).join(', ');

  const message = `Salut City Sneakers, moi c'est ${nomClient}. Je commande : ${texteArticles}. Total : ${totalPrix}$. Livraison à ${commune}. Mon numéro : ${phoneClient}`;
  
  // Vider le panier après la commande
  cart = [];
  saveCartToStorage();
  renderCart();
  
  // ⚠️ Remplace les X par ton vrai numéro WhatsApp avec l'indicatif (ex: 243...)
  window.open(`https://wa.me/243XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');
}

// ==========================================
// 8. DÉMARRAGE AUTOMATIQUE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  chargerProduits();
  renderCart();
});
