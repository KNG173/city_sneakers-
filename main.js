const API_BASE_URL = 'http://localhost/city_sneakers';

// Catalogue local (fallback) chargé depuis products.json + liste courante affichée
let localItems = [];
let allItems = [];

function buildLocalItemsFromCatalogJson(catalogJson) {
  if (!catalogJson || typeof catalogJson !== "object") throw new Error("products.json invalide");
  const out = [];
  Object.keys(catalogJson).forEach((cat) => {
    const list = Array.isArray(catalogJson[cat]) ? catalogJson[cat] : [];
    list.forEach((p, idx) => {
      out.push({
        id: `${String(cat).toLowerCase()}-${idx + 1}`,
        name: String(p?.name ?? "").trim(),
        img: String(p?.img ?? "").trim(),
        price: Number(p?.price ?? 0),
        cat: String(cat).toLowerCase()
      });
    });
  });
  return out.filter(p => p.id && p.name && Number.isFinite(p.price));
}

async function chargerCatalogueLocal() {
  // Si la page est ouverte en file://, le fetch de products.json échoue souvent.
  if (location.protocol === "file:") {
    console.warn("Ouvre le site via un serveur local pour charger products.json (ex: Live Server).");
    localItems = [];
    allItems = [];
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch("products.json", { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`products.json HTTP ${res.status}`);
    const json = await res.json();
    localItems = buildLocalItemsFromCatalogJson(json);
    allItems = localItems.slice();
  } catch (e) {
    console.error("Impossible de charger products.json :", e);
    localItems = [];
    allItems = [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/* Panier : tableau d'objets { id, name, price, img, sz, qty } */
let cart = [];

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem('citySneakersCart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && item.id && item.name && Number.isFinite(Number(item.price)) && Number.isFinite(Number(item.qty)));
  } catch (e) {
    console.warn('Impossible de charger le panier localStorage', e);
    return [];
  }
}

function saveCartToStorage() {
  localStorage.setItem('citySneakersCart', JSON.stringify(cart));
}

function normalizeProducts(data) {
  if (!Array.isArray(data)) throw new Error("Réponse invalide (pas un tableau)");
  return data
    .map(p => ({
      id: String(p?.id ?? '').trim(),
      name: String(p?.name ?? '').trim(),
      cat: String(p?.cat ?? '').trim().toLowerCase(),
      img: String(p?.img ?? '').trim(),
      price: Number(p?.price ?? 0)
    }))
    .filter(p => p.id && p.name && Number.isFinite(p.price));
}

async function chargerProduits() {
  const grid = document.getElementById('grid');
  grid.innerHTML = "<p>Chargement du catalogue...</p>";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // ON POINTE VERS TON NOUVEAU FICHIER PHP ICI
    const response = await fetch(`${API_BASE_URL}/getProduits.php`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    // On récupère le JSON envoyé par getProduits.php
    const produits = await response.json();
    
  // Dans ton fichier main.js, modifie cette partie précise :
const produitsNormalises = produits.map(p => ({
  id: String(p.id).trim(),
  name: String(p.nom).trim(),
  cat: String(p.categorie).toLowerCase().trim(), // On utilise la catégorie de la BDD !
  img: String(p.image).trim(),
  price: Number(p.prix)
}));

    allItems = produitsNormalises;
    renderGrid(allItems);
    console.log("Données chargées depuis MySQL local !");
  } catch (error) {
    console.error("Erreur de chargement :", error);
    // Fallback : on affiche le catalogue local si l'API échoue
    allItems = localItems.slice();
    renderGrid(allItems);
  } finally {
    clearTimeout(timeoutId);
  }
}
/* ========== AU CHARGEMENT DE LA PAGE ========== */
window.onload = async () => {
  // Charge d'abord le fallback local depuis products.json
  await chargerCatalogueLocal();

  // Cache le preloader après 1.5s
  setTimeout(() => {
    document.getElementById('preloader').style.display = 'none';
    // APPEL DE LA BASE DE DONNÉES
    chargerProduits();
  }, 1500);

  /* Restaurer le thème (clair/sombre) sauvegardé dans localStorage */
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('theme-icon').className = 'fas fa-sun';
  }
  cart = loadCartFromStorage();
  renderCart();
  renderHero();
};

/** Bascule entre thème sombre et clair ; sauvegarde dans localStorage */
function toggleTheme() {
  const body = document.documentElement;
  const icon = document.getElementById('theme-icon');
  if (body.getAttribute('data-theme') === 'light') {
    body.removeAttribute('data-theme');
    icon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'dark');
  } else {
    body.setAttribute('data-theme', 'light');
    icon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'light');
  }
}

/** Affiche le slider hero avec les images (affiche2.png, affiche1.png, image.png) ; rotation toutes les 5 s */
function renderHero() {
  const h = document.getElementById('hero');
  const imgs = ['affiche2.png', 'affiche1.png', 'image.png'];
  imgs.forEach((img, i) => {
    const s = document.createElement('div');
    s.className = i === 0 ? 'slide active' : 'slide';
    s.style.backgroundImage = `url('${img}')`;
    s.innerHTML = '<div class="slide-overlay"></div>';
    h.appendChild(s);
  });
  let c = 0;
  setInterval(() => {
    const slides = document.querySelectorAll('.slide');
    if (slides.length < 2) return;
    slides[c].classList.remove('active');
    c = (c + 1) % slides.length;
    slides[c].classList.add('active');
  }, 5000);
}

/** Affiche la grille de produits à partir du tableau "data" */
function renderGrid(data) {
  const grid = document.getElementById('grid');
  let html = '';
  data.forEach(p => {
    const sizeId = 'size-' + p.id;
    html += '<div class="p-card"><div class="p-img"><img src="' + p.img + '" onerror="this.src=\'https://placehold.co/400x400/222/fff?text=Sneaker\'"></div><div class="p-info"><div class="p-name">' + p.name + '</div><span class="p-price">$' + p.price + '</span><select id="' + sizeId + '" class="sz-select"><option value="">Taille...</option>' + [39,40,41,42,43,44,45].map(s => '<option value="' + s + '">' + s + '</option>').join('') + '</select><div class="btn-row"><button class="add-btn" onclick="addToCart(\'' + p.id + '\', \'' + p.name.replace(/'/g, "\\'") + '\', ' + p.price + ', \'' + p.img + '\', \'' + sizeId + '\')">AJOUTER</button><a href="https://wa.me/243848151078?text=Bonjour, je souhaite négocier pour : ' + encodeURIComponent(p.name) + '" class="wa-btn"><i class="fab fa-whatsapp"></i></a></div></div></div>';
  });
  grid.innerHTML = html;
}

/** Filtre par catégorie */
function filter(c, b) {
  document.querySelectorAll('.f-btn').forEach(btn => btn.classList.remove('active'));
  b.classList.add('active');
  renderGrid(c === 'all' ? allItems : allItems.filter(i => (i.cat || '').toLowerCase() === c));
}

/** Recherche en temps réel */
function doSearch() {
  const q = document.getElementById('searchInp').value.trim().toLowerCase();
  if (q === "") {
    renderGrid(allItems);
    return;
  }
  renderGrid(allItems.filter(i => i.name.toLowerCase().includes(q)));
}

function showToast(msg, duration = 1500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  if (t._timeout) clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.style.display = 'none', duration);
}

function showStatus(msg, type = 'info') {
  const banner = document.getElementById('statusBanner');
  if (!banner) return;
  banner.textContent = msg;
  banner.className = 'status ' + type;
  banner.style.opacity = '1';
  if (banner._timeout) clearTimeout(banner._timeout);
  banner._timeout = setTimeout(() => {
    banner.style.opacity = '0';
  }, 4000);
}

function addToCart(id, name, price, img, sizeId) {
  const sz = document.getElementById(sizeId).value;
  if (!sz) {
    showToast("Sélectionnez une pointure.");
    return;
  }
  const existing = cart.find(i => i.id === id && i.sz === sz);
  if (existing) existing.qty += 1;
  else cart.push({ id, name, price, img, sz, qty: 1 });
  saveCartToStorage();
  renderCart();
  showToast("Ajouté au panier !");
}

function renderCart() {
  const list = document.getElementById('cartItems');
  const del = Number(document.getElementById('deliveryZone').value) || 0;
  let sub = 0, totalCount = 0, html = '';
  if (!cart.length) {
    list.innerHTML = '<div style="padding: 20px; text-align: center; color: #555;">Aucun article dans le panier.</div>';
  } else {
    cart.forEach((item, i) => {
      const lineTotal = Number(item.price || 0) * Number(item.qty || 0);
      sub += lineTotal;
      totalCount += Number(item.qty || 0);
      html += '<div class="cart-item"><img src="' + item.img + '" class="cart-img"><div class="cart-info"><div class="cart-name">' + item.name + '</div><div class="cart-meta">Pointure: ' + item.sz + ' • $' + item.price + ' / paire</div><div class="cart-actions"><button class="qty-btn" onclick="updateQty(' + i + ', -1)">-</button><span class="qty-value">' + item.qty + '</span><button class="qty-btn" onclick="updateQty(' + i + ', 1)">+</button><span style="margin-left:auto;">$' + lineTotal.toFixed(2) + '</span></div></div><i class="fas fa-trash-alt cart-remove" onclick="removeFromCart(' + i + ')"></i></div>';
    });
    list.innerHTML = html;
  }
  saveCartToStorage();
  document.getElementById('b-top').innerText = document.getElementById('b-bot').innerText = totalCount;
  document.getElementById('total-price').innerText = '$' + (sub + del).toFixed(2);
}

function updateQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}

function removeFromCart(index) {
  if (!cart[index]) return;
  cart.splice(index, 1);
  renderCart();
}

function toggleCart(s) {
  document.getElementById('sidebar').classList.toggle('open', s);
  document.getElementById('overlay').style.display = s ? 'block' : 'none';
}

async function enregistrerCommande(details) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(details),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log("Commande enregistrée dans Oracle !", data);
    return data;
  } catch (error) {
    console.error("Erreur d'enregistrement de commande:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function createOrderDetails() {
  const z = document.getElementById('deliveryZone');
  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const phoneClient = (document.getElementById('phone_client')?.value || '').trim();
  return {
    customer_name: (document.getElementById('nom_client')?.value || '').trim(),
    customer_phone: phoneClient,
    delivery_zone: z ? z.options[z.selectedIndex].text : 'Inconnue',
    delivery_fee: z ? Number(z.value) || 0 : 0,
    payment_method: paymentEl ? paymentEl.value : 'Non précisé',
    items: cart.map(i => ({
      product_id: i.id || null,
      product_name: i.name,
      img: i.img || null,
      size: i.sz || null,
      unit_price: Number(i.price),
      qty: Number(i.qty)
    }))
  };
}

function sendWA() {
  if (!cart.length) {
    showStatus("Votre panier est vide.", 'warning');
    return;
  }
  const z = document.getElementById('deliveryZone');
  if (!z || Number(z.value) === 0) {
    showStatus("Choisissez une commune pour livraison.", 'warning');
    return;
  }

  const nomClient = (document.getElementById('nom_client')?.value || '').trim();
  if (!nomClient) {
    showStatus("Veuillez saisir votre nom.", 'warning');
    return;
  }

  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const payment = paymentEl ? paymentEl.value : 'Non précisé';

  const details = createOrderDetails();
  details.customer_name = nomClient;
  details.payment_method = payment;

  showStatus('Enregistrement de la commande en cours...', 'info');

  const articlePrincipal = cart.length ? cart[0].name : 'Aucun produit';
  message = "🚀 *NOUVELLE COMMANDE - CITY SNEAKERS*\n";
  message += `👤 Client : ${nomClient}\n`;
  message += `👟 Article principal : ${articlePrincipal}\n`;
  message += `📍 Commune : ${details.delivery_zone}\n`;
  message += `💳 Paiement : ${payment}\n\n`;
  message += "🛍️ Détails :\n";
  let sub = 0;
  cart.forEach(i => {
    const line = Number(i.price || 0) * Number(i.qty || 0);
    sub += line;
    message += `• ${i.name} (Taille ${i.sz}) x${i.qty} = $${line.toFixed(2)}\n`;
  });
  const frais = Number(details.delivery_fee || 0);
  const total = sub + frais;
  message += `\n📦 Sous-total : $${sub.toFixed(2)}\n`;
  message += `🚚 Livraison : $${frais.toFixed(2)}\n`;
  message += `💰 TOTAL : $${total.toFixed(2)}\n`;

  enregistrerCommande(details)
    .then(saved => {
      if (saved && saved.order_id) {
        message += `\n🧾 N° Commande : ${saved.order_id}`;
        showStatus('Commande enregistrée !', 'success');
      } else {
        showStatus('Commande enregistrée localement, envoi WhatsApp...', 'info');
      }
    })
    .catch(() => {
      showStatus('Erreur serveur, envoi WhatsApp en mode offline.', 'error');
    })
    .finally(() => {
      window.open('https://wa.me/243848151078?text=' + encodeURIComponent(message));
      cart = [];
      saveCartToStorage();
      renderCart();
      toggleCart(false);
    });
}

function calculTotal() {
  const sub = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  const del = Number(document.getElementById('deliveryZone')?.value || 0);
  return sub + del;
}

function finaliserAchat(bouton) {
  const nomClient = (document.getElementById('nom_client')?.value || '').trim();
  const phoneClient = (document.getElementById('phone_client')?.value || '').trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'Non précisé';
  const deliveryZone = document.getElementById('deliveryZone');
  const commune = deliveryZone ? deliveryZone.options[deliveryZone.selectedIndex]?.text : '';
  const communeValue = deliveryZone ? Number(deliveryZone.value) : 0;

  if (!nomClient) {
    showStatus('Veuillez saisir votre nom.', 'warning');
    return;
  }
  if (!phoneClient) {
    showStatus('Veuillez saisir votre téléphone.', 'warning');
    return;
  }
  if (!deliveryZone || communeValue === 0) {
    showStatus('Veuillez choisir une commune.', 'warning');
    return;
  }

  let nomArticle = 'Aucun produit';
  let prixArticle = 0;
  let items = [];

  if (bouton) {
    const produitCard = bouton.closest('.produit-card');
    if (!produitCard) {
      showStatus('Impossible de retrouver le produit. Veuillez réessayer.', 'error');
      return;
    }
    nomArticle = produitCard.querySelector('.nom-chaussure')?.innerText || 'Produit inconnu';
    prixArticle = parseFloat(produitCard.querySelector('.prix')?.innerText.replace(/[^0-9.]/g, '')) || 0;
    items = [{ product_name: nomArticle, unit_price: Number(prixArticle.toFixed(2)), qty: 1 }];
  } else {
    if (!cart.length) {
      showStatus('Votre panier est vide.', 'warning');
      return;
    }
    nomArticle = cart.map(i => i.name).join(' + ');
    prixArticle = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    items = cart.map(i => ({ product_id: i.id, product_name: i.name, size: i.sz, unit_price: Number(i.price), qty: Number(i.qty) }));
  }

  const fraisLivraison = Number(communeValue);
  const totalPrix = prixArticle + fraisLivraison;

  const detailsCommande = {
    nom_client: nomClient,
    tel_client: phoneClient,
    nom_article: nomArticle,
    commune_livraison: commune,
    prix_article: Number(prixArticle.toFixed(2)),
    frais_livraison: Number(fraisLivraison.toFixed(2)),
    total_prix: Number(totalPrix.toFixed(2)),
    mode_paiement: paymentMethod,
    items
  };

  enregistrerCommande(detailsCommande);

  const message = `Salut City Sneakers, moi c'est ${nomClient} (${phoneClient}). Je commande ${nomArticle} (${prixArticle.toFixed(2)}$). Livraison à ${commune}. Mode: ${paymentMethod}. Total: ${totalPrix.toFixed(2)}$`;

  cart = [];
  saveCartToStorage();
  renderCart();

  const success = document.getElementById('successPage');
  const successText = document.getElementById('successText');
  if (success && successText) {
    successText.innerText = `Commande enregistrée ! Total: $${totalPrix.toFixed(2)}. Ton message WhatsApp s’ouvre maintenant.`;
    success.style.display = 'flex';
  }

  window.open(`https://wa.me/243848151078?text=${encodeURIComponent(message)}`, '_blank');
}

function closeSuccessPage() {
  const success = document.getElementById('successPage');
  if (success) success.style.display = 'none';
}

