const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
    this.opacity = Math.random() * 0.6 + 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width) this.x = 0;
    else if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    else if (this.y < 0) this.y = canvas.height;
  }
  draw() {
    ctx.fillStyle = `rgba(0, 255, 82, ${this.opacity})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff52';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function initParticles() {
  particlesArray = [];
  const particleCount = Math.floor((canvas.width * canvas.height) / 18000);
  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle());
  }
}
initParticles();

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// The catalog (prices + stock) lives in the database and is edited from admin.html.
const CATALOG_CACHE_KEY = 'forest_catalog_cache';
let PRODUCTS = cachedCatalog();

function cachedCatalog() {
  try {
    const cached = JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY));
    return Array.isArray(cached) ? cached : [];
  } catch (e) { return []; }
}

function applyCatalog(list) {
  PRODUCTS = list;
  try { localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(list)); } catch (e) {}
  const changed = Cart.sync(PRODUCTS);
  if (changed) showToast('🛒 Cart updated', 'Some prices or availability changed, please review your cart.');
}

async function fetchCatalog() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const base = ((window.FOREST_CONFIG && window.FOREST_CONFIG.apiBaseUrl) || '').replace(/\/+$/, '');
    const res = await fetch(base + '/api/products', { signal: controller.signal });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data) || !data.length) return null;
    return data;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadCatalog() {
  const fresh = await fetchCatalog();
  if (fresh) { applyCatalog(fresh); return; }
  PRODUCTS = cachedCatalog();
  let tries = 0;
  const retry = setInterval(async () => {
    tries += 1;
    const data = await fetchCatalog();
    if (data) {
      clearInterval(retry);
      applyCatalog(data);
      renderProducts();
    } else if (tries >= 20) {
      clearInterval(retry);
    }
  }, 8000);
}

let currentPage = 1;
let currentCategory = 'all';
let currentSubCategory = 'all';
let searchQuery = '';
const PRODUCTS_PER_PAGE = 8;
const MAX_PAGES = 10;

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getFilteredProducts() {
  const query = normalizeText(searchQuery);
  return PRODUCTS.filter(p => {
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
    const matchesSubCategory = (currentCategory !== 'discord') || (currentSubCategory === 'all') || (p.subCategory === currentSubCategory);
    const matchesSearch = query === '' ||
                          normalizeText(p.title).includes(query) ||
                          normalizeText(p.desc).includes(query);
    return matchesCategory && matchesSubCategory && matchesSearch;
  });
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  if (!PRODUCTS.length) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#9ca3af; padding:60px 0;">Loading products… the server may be waking up, this can take up to a minute.</p>';
    return;
  }
  const noProds = document.getElementById('no-products');
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    container.style.display = 'none';
    noProds.style.display = 'block';
    renderPagination(0);
    return;
  }

  container.style.display = 'grid';
  noProds.style.display = 'none';

  let totalPages = Math.min(Math.ceil(filtered.length / PRODUCTS_PER_PAGE), MAX_PAGES);
  if (totalPages < 1) totalPages = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  container.innerHTML = paginatedItems.map(p => `
    <div class="card-hover" style="position:relative; background:rgba(18,24,18,0.6); border:1px solid rgba(0,255,82,.15); border-radius:20px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; backdrop-filter:blur(10px);">

      <div>
        <div style="position:relative; width:100%; height:160px; overflow:hidden;">
          <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'" />
          <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(10,13,10,0.2) 0%, rgba(10,13,10,0.95) 100%);"></div>

          <div style="position:absolute; top:14px; left:14px; right:14px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            ${p.badge ? `<span style="background:rgba(0,255,82,.15); border:1px solid rgba(0,255,82,.4); color:var(--green-a); font-size:10px; font-weight:800; padding:4px 10px; border-radius:9999px; text-transform:uppercase; letter-spacing:0.05em; backdrop-filter:blur(6px); shadow:0 0 10px rgba(0,255,82,0.3);">${p.badge}</span>` : '<span></span>'}

            <span class="badge-stock ${p.inStock ? 'badge-in-stock' : 'badge-out-stock'}" style="backdrop-filter:blur(6px);">
              <span style="width:6px; height:6px; border-radius:50%; background:${p.inStock ? 'var(--green-a)' : 'var(--red-a)'}; display:inline-block; box-shadow:0 0 6px ${p.inStock ? 'var(--green-a)' : 'var(--red-a)'}"></span>
              ${p.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div style="position:absolute; bottom:12px; left:16px; width:42px; height:42px; border-radius:12px; background:rgba(0,255,82,.12); border:1px solid rgba(0,255,82,.3); display:flex; align-items:center; justify-content:center; color:var(--green-a); backdrop-filter:blur(8px); box-shadow:0 0 15px rgba(0,255,82,0.2);">
            <i data-lucide="${p.icon}" style="width:22px;height:22px;"></i>
          </div>

          <button type="button" class="btn-cart-add" onclick="addToCartFromCard('${p.id}')" ${!p.inStock ? 'disabled' : ''} aria-label="Add to cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
        </div>

        <div style="padding:18px 20px 0 20px;">
          <h3 style="color:#fff; font-weight:800; font-size:18px; margin:0 0 6px 0;">${p.title}</h3>
          <p style="color:#9ca3af; font-size:13px; line-height:1.5; margin:0 0 16px; height:38px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${p.desc}</p>

          <ul style="list-style:none; padding:0; margin:0 0 18px 0; font-size:12px; color:#d1d5db; display:flex; flex-direction:column; gap:6px;">
            ${p.features.map(f => `<li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px; height:14px; color:var(--green-a); flex-shrink:0;"></i> ${f}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="padding:16px 20px 20px 20px; border-top:1px solid rgba(255,255,255,.05); display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <span style="font-size:10px; color:#6b7280; display:block; text-transform:uppercase; letter-spacing:0.05em;">Starting from</span>
          <span style="font-size:20px; font-weight:900; color:var(--green-a); font-family:monospace; text-shadow:0 0 10px rgba(0,255,82,0.3);">${p.price}</span>
        </div>
        <button class="btn-primary" onclick="openOrderModal('${p.id}')" ${!p.inStock ? 'disabled' : ''} style="padding:10px 18px; border-radius:10px; font-size:13px; display:flex; align-items:center; gap:6px;">
          <span>${p.inStock ? 'Buy Now' : 'Sold Out'}</span>
          <i data-lucide="${p.inStock ? 'arrow-right' : 'slash'}" style="width:14px; height:14px;"></i>
        </button>
      </div>
    </div>
  `).join('');

  renderPagination(totalPages);
  if (window.lucide) lucide.createIcons();
}

function renderPagination(totalPages) {
  let navContainer = document.getElementById('pagination-nav');
  if (!navContainer) {
    navContainer = document.createElement('div');
    navContainer.id = 'pagination-nav';
    navContainer.style.cssText = "display:flex; justify-content:center; align-items:center; gap:10px; margin-top:40px;";
    document.getElementById('products-grid').parentNode.appendChild(navContainer);
  }

  if (totalPages <= 1) {
    navContainer.innerHTML = '';
    return;
  }

  let buttonsHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} style="background:rgba(255,255,255,0.03); border:1px solid rgba(0,255,82,0.2); color:#fff; padding:8px 16px; border-radius:10px; font-weight:700; transition:all 0.3s; opacity: ${currentPage === 1 ? 0.4 : 1}; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};">
      &laquo; Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    buttonsHTML += `
      <button onclick="changePage(${i})" style="background:${i === currentPage ? 'var(--green-a)' : 'rgba(255,255,255,0.03)'}; color:${i === currentPage ? '#000' : '#fff'}; border:1px solid ${i === currentPage ? 'var(--green-a)' : 'rgba(0,255,82,0.2)'}; font-weight:800; padding:8px 14px; border-radius:10px; cursor:pointer; transition:all 0.3s; box-shadow: ${i === currentPage ? '0 0 15px rgba(0,255,82,0.4)' : 'none'};">
        ${i}
      </button>
    `;
  }

  buttonsHTML += `
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} style="background:rgba(255,255,255,0.03); border:1px solid rgba(0,255,82,0.2); color:#fff; padding:8px 16px; border-radius:10px; font-weight:700; transition:all 0.3s; opacity: ${currentPage === totalPages ? 0.4 : 1}; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};">
      Next &raquo;
    </button>
  `;

  navContainer.innerHTML = buttonsHTML;
}

function changePage(page) {
  currentPage = page;
  renderProducts();
  document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');

    currentCategory = e.currentTarget.getAttribute('data-category');
    currentSubCategory = 'all';

    const subFilterContainer = document.getElementById('subfilter-container');
    if (subFilterContainer) {
      if (currentCategory === 'discord') {
        subFilterContainer.style.display = 'flex';
      } else {
        subFilterContainer.style.display = 'none';
      }
    }

    document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.sub-filter-btn[data-sub="all"]')?.classList.add('active');

    currentPage = 1;
    renderProducts();
  });
});

document.querySelectorAll('.sub-filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');

    currentSubCategory = e.currentTarget.getAttribute('data-sub');
    currentPage = 1;
    renderProducts();
  });
});

const searchInput = document.getElementById('store-search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;

    const subFilterContainer = document.getElementById('subfilter-container');
    if (currentCategory === 'discord') {
      subFilterContainer.style.display = 'flex';
    } else {
      subFilterContainer.style.display = 'none';
      currentSubCategory = 'all';
    }

    renderProducts();
  });
}

const modal = document.getElementById('order-modal');
const closeModalBtn = document.getElementById('close-modal');
let currentSelectedProduct = null;

let checkoutMode = 'single';

function requireLogin() {
  if (Auth.isLoggedIn()) return true;
  showToast('🔒 Authentication Required', 'Please log in to your account before placing an order.');
  return false;
}

function openOrderModal(productId, options) {
  if (!(options && options.skipAuth) && !requireLogin()) return;

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !product.inStock) return;
  currentSelectedProduct = product;
  checkoutMode = 'single';
  document.getElementById('cart-summary').style.display = 'none';
  document.getElementById('add-to-cart-btn').style.display = 'flex';

  document.getElementById('modal-product-title').textContent = product.title;
  document.getElementById('modal-product-price').textContent = product.price;
  document.getElementById('modal-product-img').src = product.image;

  const variantsContainer = document.getElementById('variants-container');
  const variantsOptions = document.getElementById('variants-options');

  if (product.variants && product.variants.length > 0) {
    variantsContainer.style.display = 'block';
    variantsOptions.innerHTML = product.variants.map((v, index) => `
      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:rgba(255,255,255,.03); border:1px solid rgba(0,255,82,.2); border-radius:10px; cursor:pointer;">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="radio" name="product_variant" value="${v.title}" ${index === 0 ? 'checked' : ''} style="accent-color:var(--green-a);" onchange="updateVariantPrice('${v.price}')" />
          <span style="font-size:13px; color:#fff; font-weight:700;">${v.title}</span>
        </div>
        <span style="font-size:13px; color:var(--green-a); font-weight:800;">${v.price}</span>
      </label>
    `).join('');
    document.getElementById('modal-product-price').textContent = product.variants[0].price;
  } else {
    variantsContainer.style.display = 'none';
    variantsOptions.innerHTML = '';
  }

  document.querySelector('input[name="payment"][value="D17"]').checked = true;
  updatePaymentFields();

  document.getElementById('submit-order-btn').style.display = 'flex';

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function addToCartFromModal() {
  if (!currentSelectedProduct) return;
  const checked = document.querySelector('input[name="product_variant"]:checked');
  const variant = checked ? currentSelectedProduct.variants.find(v => v.title === checked.value) : null;
  Cart.add(currentSelectedProduct, variant);
  modal.classList.remove('active');
  showToast('🛒 Added to cart', currentSelectedProduct.title + (variant ? ' (' + variant.title + ')' : ''));
}

function addToCartFromCard(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !product.inStock) return;
  if (product.variants && product.variants.length > 0) {
    openOrderModal(productId, { skipAuth: true });
    return;
  }
  Cart.add(product, null);
  showToast('🛒 Added to cart', product.title);
}

function openCartCheckout() {
  if (!Cart.count() || !requireLogin()) return;
  const items = Cart.getItems();
  checkoutMode = 'cart';
  currentSelectedProduct = null;

  document.getElementById('modal-product-title').textContent = `Cart (${Cart.count()} items)`;
  document.getElementById('modal-product-price').textContent = Cart.totalLabel();
  document.getElementById('modal-product-img').src = items[0].image || 'assets/img/logo.png';

  const summary = document.getElementById('cart-summary');
  summary.innerHTML = '';
  items.forEach(i => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; gap:12px;';
    const name = document.createElement('span');
    name.textContent = `${i.qty}× ${i.title}${i.variant ? ' (' + i.variant + ')' : ''}`;
    const price = document.createElement('span');
    price.style.cssText = 'color:var(--green-a); font-weight:800; white-space:nowrap;';
    price.textContent = Cart.formatAmount(i.amount * i.qty, i.currency);
    row.appendChild(name);
    row.appendChild(price);
    summary.appendChild(row);
  });
  summary.style.display = 'flex';

  document.getElementById('variants-container').style.display = 'none';
  document.getElementById('variants-options').innerHTML = '';
  document.getElementById('add-to-cart-btn').style.display = 'none';
  document.getElementById('submit-order-btn').style.display = 'flex';

  document.querySelector('input[name="payment"][value="D17"]').checked = true;
  updatePaymentFields();

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function updateVariantPrice(price) {
  document.getElementById('modal-product-price').textContent = price;
}

function updatePaymentFields() {
  const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
  const dynamicFields = document.getElementById('dynamic-fields');

  if (selectedPayment === 'Discord Credit') {
    dynamicFields.innerHTML = `
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Numéro de téléphone (Obligatoire)</label>
        <input type="tel" id="customer-numero" required placeholder="e.g. 27966681" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Email Address (Obligatoire)</label>
        <input type="email" id="user-email" required placeholder="name@example.com" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Discord Username (Obligatoire)</label>
        <input type="text" id="discord-username" required placeholder="e.g. username" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div>
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Discord ID (Obligatoire)</label>
        <input type="text" id="discord-id" required placeholder="e.g. 123456789012345678" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
    `;
  } else if (selectedPayment === 'D17' || selectedPayment === 'Binance') {
    dynamicFields.innerHTML = `
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Numéro de téléphone (Obligatoire)</label>
        <input type="tel" id="customer-numero" required placeholder="e.g. 27966681" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Email Address (Obligatoire)</label>
        <input type="email" id="user-email" required placeholder="name@example.com" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Discord Username (Optionnel)</label>
        <input type="text" id="discord-username" placeholder="e.g. username" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div>
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Discord ID (Optionnel)</label>
        <input type="text" id="discord-id" placeholder="e.g. 123456789012345678" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
    `;
  } else if (selectedPayment === 'Ooredoo') {
    dynamicFields.innerHTML = `
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Numéro de téléphone (Obligatoire)</label>
        <input type="tel" id="customer-numero" required placeholder="e.g. 27966681" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Email Address (Obligatoire)</label>
        <input type="email" id="user-email" required placeholder="name@example.com" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Discord Username (Optionnel)</label>
        <input type="text" id="discord-username" placeholder="e.g. username" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
      <div>
        <label style="display:block; color:#d1d5db; font-size:13px; font-weight:700; margin-bottom:6px;">Discord ID (Optionnel)</label>
        <input type="text" id="discord-id" placeholder="e.g. 123456789012345678" style="width:100%; padding:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;" />
      </div>
    `;
  }
}

closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('active');
});

const INVOICES_KEY = 'forest_invoices';
const INVOICE_LINES_Y = [384, 353, 322];

function selectedItems() {
  if (checkoutMode === 'cart') {
    return Cart.getItems().map(i => ({ id: i.id, variant: i.variant, qty: i.qty }));
  }
  const checked = document.querySelector('input[name="product_variant"]:checked');
  const variant = checked ? currentSelectedProduct.variants.find(v => v.title === checked.value) : null;
  return [{ id: currentSelectedProduct.id, variant: variant ? variant.title : '', qty: 1 }];
}

function describeItem(i) {
  return `${i.qty > 1 ? i.qty + 'x ' : ''}${i.title}${i.variant ? ' (' + i.variant + ')' : ''}`;
}

function pdfSafe(font, text) {
  return Array.from(String(text)).map(ch => {
    try {
      font.widthOfTextAtSize(ch, 1);
      return ch;
    } catch (err) {
      return '?';
    }
  }).join('');
}

function fitSize(font, text, maxSize, maxWidth) {
  let size = maxSize;
  while (size > 8 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

async function buildInvoice(order) {
  const response = await fetch('assets/docs/facture.pdf');
  if (!response.ok) {
    throw new Error('facture.pdf introuvable sur le serveur (vérifiez que le fichier "facture.pdf" est bien uploadé à la racine du site).');
  }
  const { PDFDocument, rgb, StandardFonts } = PDFLib;
  const pdfDoc = await PDFDocument.load(await response.arrayBuffer());
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const color = rgb(0.1, 0.1, 0.1);
  const draw = (text, x, y, size) => {
    const safe = pdfSafe(font, text);
    page.drawText(safe, { x, y, size: size || fitSize(font, safe, 11, 380), font, color });
  };

  draw(order.customer.phone, 180, 593, 11);
  draw(order.customer.email, 180, 567, 11);
  draw(order.invoiceDiscordId, 180, 541, 11);
  draw(order.invoiceUsername, 180, 515, 11);

  const single = order.items.length === 1;
  const rows = order.items.length > INVOICE_LINES_Y.length
    ? order.items.slice(0, INVOICE_LINES_Y.length - 1).concat([{ more: order.items.length - (INVOICE_LINES_Y.length - 1) }])
    : order.items;
  rows.forEach((row, n) => {
    const y = INVOICE_LINES_Y[n];
    if (row.more) {
      draw(`+ ${row.more} more items`, 62, y, 13);
      return;
    }
    const name = pdfSafe(font, describeItem(row));
    draw(name, 62, y, fitSize(font, name, single ? 24 : 13, 400));
    draw(row.lineTotal, 482, single ? y - 9 : y, single ? 20 : 13);
  });

  const total = pdfSafe(font, order.total);
  draw(total, 452, 188, fitSize(font, total, 16, 130));
  draw(order.payment, 60, 69, 20);

  return new Blob([await pdfDoc.save()], { type: 'application/pdf' });
}

function blobToDataUrl(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });
}

// Keep the generated PDF of the 10 latest orders in this browser so profile.html can re-download it.
function cacheInvoice(order, factureData) {
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(INVOICES_KEY)) || {}; } catch (err) {}
  cache[order.orderId] = { pdf: factureData, invoiceUsername: order.invoiceUsername, invoiceDiscordId: order.invoiceDiscordId };
  const ids = Object.keys(cache);
  ids.slice(0, Math.max(0, ids.length - 10)).forEach(id => delete cache[id]);
  try { localStorage.setItem(INVOICES_KEY, JSON.stringify(cache)); } catch (err) {}
}

async function handleOrderSubmit(e) {
  e.preventDefault();
  if (!requireLogin()) return;
  if (checkoutMode === 'cart' ? !Cart.count() : !currentSelectedProduct) return;

  const submitBtn = document.getElementById('submit-order-btn');
  if (submitBtn && submitBtn.disabled) return;
  const usernameInput = document.getElementById('discord-username');
  const idInput = document.getElementById('discord-id');
  const typedUsername = usernameInput ? usernameInput.value.trim() : '';
  const typedId = idInput ? idInput.value.trim() : '';
  const user = Auth.getUser();
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const customer = {
    discordUsername: typedUsername,
    discordId: typedId,
    email: document.getElementById('user-email').value,
    phone: document.getElementById('customer-numero').value
  };

  if (submitBtn) submitBtn.disabled = true;
  showToast('Processing...', 'Sending your order...');

  // The server prices the order from its own catalog; we only send ids, options and quantities.
  let res;
  try {
    res = await Auth.request('/api/orders', { method: 'POST', body: { items: selectedItems(), payment, customer } });
  } catch (err) {
    if (submitBtn) submitBtn.disabled = false;
    showToast('Server unreachable', 'Nothing was sent. The server may be waking up, please try again in a moment.');
    return;
  }
  if (submitBtn) submitBtn.disabled = false;

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      showToast('🔒 Session problem', res.data.error || 'Please log in again.');
      setTimeout(() => { location.href = Auth.loginUrl(); }, 1800);
    } else {
      showToast('Order not sent', res.data.error || 'Please check your order and try again.');
      loadCatalog().then(renderProducts);
    }
    return;
  }

  const saved = res.data.order;
  const order = {
    orderId: saved.orderId,
    date: new Date(saved.date).toLocaleString(),
    payment: saved.payment,
    items: saved.items,
    total: saved.total,
    invoiceUsername: typedUsername || (user && user.username) || 'Client',
    invoiceDiscordId: typedId || (user && user.discordId) || '-',
    customer
  };

  if (checkoutMode === 'cart') Cart.clear();
  modal.classList.remove('active');

  try {
    const blob = await buildInvoice(order);
    cacheInvoice(order, await blobToDataUrl(blob));
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Facture_${order.invoiceDiscordId}.pdf`;
    link.click();
  } catch (error) {
    showToast('Order received', `Order ${order.orderId} was saved, but the PDF invoice could not be generated. Contact us with your order ID.`);
  }
  showCompletionOptions(order);
}

function showCompletionOptions(order) {
  const storePhone = FOREST_CONFIG.whatsappNumber.replace(/\D/g, '');
  const userId = order.orderId;
  const product = order.items.map(describeItem).join(", ");
  const price = order.total;
  const payment = order.payment;
  const numero = order.customer.phone;
  const messageText = `مرحباً Forest Store، لقد قمت بطلب:\n- المنتج: ${product}\n- السعر: ${price}\n- الدفع: ${payment}\n- رقم الهاتف: ${numero}\n- معرف الطلب: ${userId}\n\n(لقد قمت بتحميل الفاتورة وسأقوم بإرسالها لكم هنا لإتمام الشراء).`;
  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;
  const discordUrl = FOREST_CONFIG.discordInvite;

  const finishHtml = `
    <div class="modal-overlay active" id="finish-modal" style="z-index: 4000;">
      <div class="modal-card" style="text-align: center;">
        <div style="width: 50px; height: 50px; background: rgba(0,255,82,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--green-a);">
          <i data-lucide="check" style="width: 28px; height: 28px;"></i>
        </div>
        <h3 style="color: #fff; font-size: 20px; font-weight: 800; margin-bottom: 8px;">The invoice has been successfully uploaded! 🎉</h3>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
         To complete the purchase, please send the downloaded invoice file to our WhatsApp number or join the Discord server, including your order ID: <strong style="color:var(--green-a);">${userId}</strong>
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${whatsappUrl}" target="_blank" style="background: #25D366; color: #fff; font-weight: 800; padding: 12px; border-radius: 10px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>Continue Order & Whatsapp
          </a>
          <a href="${discordUrl}" target="_blank" style="background: #5865F2; color: #fff; font-weight: 800; padding: 12px; border-radius: 10px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/></svg> Continue Order & Discord
          </a>
          <button onclick="document.getElementById('finish-modal').remove()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 700; margin-top: 10px;">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', finishHtml);
  if(window.lucide) lucide.createIcons();
}

const SITE_CONFIG = {
  serverName: "Forest Store",
  discordUrl: FOREST_CONFIG.discordInvite
};

document.querySelectorAll('.server-name, .server-name-inline').forEach(el => el.textContent = SITE_CONFIG.serverName);
document.querySelectorAll('.discord-link').forEach(el => el.href = SITE_CONFIG.discordUrl);

document.getElementById('year').textContent = new Date().getFullYear();

const pendingCheckout = new URLSearchParams(location.search).get('checkout') === '1';
if (pendingCheckout) history.replaceState(null, '', location.pathname);
Cart.onCheckout = openCartCheckout;
const catalogReady = loadCatalog();

let progress = 0;
const fill = document.getElementById('load-bar-fill');
const percentEl = document.getElementById('load-percent');
const loadInterval = setInterval(() => {
  progress = Math.min(progress + 3, 100);
  fill.style.width = progress + '%';
  percentEl.textContent = progress + '%';

  if (progress >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      const ls = document.getElementById('loading-screen');
      ls.style.opacity = '0';
      setTimeout(() => {
        ls.style.display = 'none';
        document.getElementById('site').style.display = 'block';
        renderProducts();
        catalogReady.then(() => {
          renderProducts();
          if (pendingCheckout) openCartCheckout();
        });
      }, 400);
    }, 200);
  }
}, 30);

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

function setMenuOpen(open){
  menuOpen = open;
  mobileMenu.style.display = menuOpen ? 'flex' : 'none';
  if (menuBtn) {
    menuBtn.innerHTML = menuOpen
      ? '<i data-lucide="x" style="width:26px;height:26px;"></i>'
      : '<i data-lucide="menu" style="width:26px;height:26px;"></i>';
    if (window.lucide) lucide.createIcons();
  }
}
if (menuBtn) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('click', (e) => {
    if (menuOpen && !mobileMenu.contains(e.target) && e.target !== menuBtn) {
      setMenuOpen(false);
    }
  });
}

const quickBtn = document.getElementById('quick-btn');
const quickMenu = document.getElementById('quick-menu');
if (quickBtn && quickMenu) {
  quickBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    quickMenu.classList.toggle('active');
  });
  document.addEventListener('click', (e) => {
    if (quickMenu.classList.contains('active') && !quickMenu.contains(e.target) && e.target !== quickBtn) {
      quickMenu.classList.remove('active');
    }
  });
}

let toastTimer = null;
function showToast(title, description, duration = 6000) {
  const toast = document.getElementById('toast-notification');
  const descEl = document.getElementById('toast-desc-text');

  if (title) toast.querySelector('.toast-title').textContent = title;
  if (description) descEl.textContent = description;

  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, duration);
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

