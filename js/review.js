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

let allReviews = [];
let reviewsError = false;

function timeAgo(value) {
  const t = new Date(value).getTime();
  if (!t) return 'Recently';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return days + ' days ago';
  return new Date(t).toLocaleDateString();
}

async function loadReviews() {
  try {
    const res = await Auth.request('/api/reviews');
    if (!res.ok || !Array.isArray(res.data)) throw new Error('bad response');
    allReviews = res.data;
    reviewsError = false;
  } catch (e) {
    reviewsError = true;
  }
  renderReviews();
}

const REVIEWS_PER_PAGE = 6;
let reviewPage = 1;

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderReviews() {
  const reviews = allReviews;
  const container = document.getElementById('reviews-container');
  document.getElementById('review-count').textContent = reviews.length;
  if (!reviews.length) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#9ca3af; padding:40px 0;">' +
      (reviewsError ? 'Could not load reviews. The server may be waking up, please refresh in a moment.' : 'No reviews yet. Be the first to share your experience!') + '</p>';
    renderReviewPagination(1);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  reviewPage = Math.min(Math.max(1, reviewPage), totalPages);
  const pageItems = reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

  container.innerHTML = pageItems.map(r => `
    <div class="card-hover" style="background:rgba(255,255,255,.02); border:1px solid rgba(0,255,82,.2); border-radius:18px; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:12px; fill:var(--green-a); background:linear-gradient(135deg, var(--green-a), var(--green-c)); display:flex; align-items:center; justify-content:center; color:#000; font-weight:900; font-size:16px;">
              ${esc(r.name.charAt(0).toUpperCase())}
            </div>
            <div>
              <h4 style="color:#fff; font-size:15px; font-weight:800; margin:0;">${esc(r.name)}</h4>
              <span style="color:var(--green-a); font-size:11px; font-weight:700;">${esc(r.role)}</span>
            </div>
          </div>
          <span style="color:#ffc107; font-size:14px; font-weight:bold;">${'★'.repeat(r.rating)}</span>
        </div>

        <div style="background:rgba(0,255,82,.05); border:1px solid rgba(0,255,82,.1); padding:6px 12px; border-radius:8px; display:inline-block; margin-bottom:12px;">
          <span style="color:#9ca3af; font-size:11px;">Purchased: </span>
          <strong style="color:#fff; font-size:12px;">${esc(r.product)}</strong>
        </div>

        <p style="color:#d1d5db; font-size:13.5px; line-height:1.6; margin:0 0 12px;">"${esc(r.text)}"</p>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,.05); padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#6b7280;">
        <span><i data-lucide="check-circle-2" style="width:12px; height:12px; color:var(--green-a); display:inline;"></i> Verified Buyer</span>
        <span>${esc(timeAgo(r.date))}</span>
      </div>
    </div>
  `).join('');

  renderReviewPagination(totalPages);
  if (window.lucide) lucide.createIcons();
}

function pageNumbers(total, current) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

function renderReviewPagination(totalPages) {
  const nav = document.getElementById('reviews-pagination');
  if (totalPages <= 1) {
    nav.innerHTML = '';
    return;
  }
  const numbers = pageNumbers(totalPages, reviewPage).map(n => n === '…'
    ? '<span class="page-gap">…</span>'
    : `<button type="button" class="page-btn${n === reviewPage ? ' active' : ''}" data-page="${n}"${n === reviewPage ? ' aria-current="page"' : ''}>${n}</button>`
  ).join('');
  nav.innerHTML =
    `<button type="button" class="page-btn page-btn-wide" data-page="${reviewPage - 1}"${reviewPage === 1 ? ' disabled' : ''}>&laquo; Prev</button>` +
    numbers +
    `<button type="button" class="page-btn page-btn-wide" data-page="${reviewPage + 1}"${reviewPage === totalPages ? ' disabled' : ''}>Next &raquo;</button>`;
}

function changeReviewPage(page) {
  reviewPage = page;
  renderReviews();
  document.getElementById('reviews-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('reviews-pagination').addEventListener('click', e => {
  const btn = e.target.closest('.page-btn');
  if (!btn || btn.disabled) return;
  changeReviewPage(parseInt(btn.getAttribute('data-page'), 10));
});

let currentSelectedStars = 5;
const starIcons = document.querySelectorAll('#star-selector i');

starIcons.forEach(star => {
  star.addEventListener('click', () => {
    currentSelectedStars = parseInt(star.getAttribute('data-star'));
    starIcons.forEach((s, idx) => {
      if (idx < currentSelectedStars) {
        s.style.color = '#ffc107';
      } else {
        s.style.color = '#4b5563';
      }
    });
  });
});

function fillReviewerName() {
  const input = document.getElementById('rev-name');
  const user = Auth.getUser();
  input.value = user ? user.name : '';
}

fillReviewerName();

async function submitNewReview(e) {
  e.preventDefault();

  const user = Auth.getUser();
  if (!user) {
    showToast('Authentication Required', 'Please log in with Discord to write a review.');
    return;
  }
  const product = document.getElementById('rev-product').value;
  const text = document.getElementById('rev-text').value.trim();
  if (!product || !text) return;

  let res;
  try {
    res = await Auth.request('/api/reviews', { method: 'POST', body: { product, text, rating: currentSelectedStars } });
  } catch (err) {
    showToast('Server unreachable', 'Your review was not sent. Please try again in a moment.');
    return;
  }
  if (!res.ok) {
    showToast('Review not sent', res.data.error || 'Please try again.');
    return;
  }

  document.getElementById('review-form').reset();
  currentSelectedStars = 5;
  starIcons.forEach(s => s.style.color = '#ffc107');
  fillReviewerName();

  reviewPage = 1;
  await loadReviews();
  showToast("Thank you for your feedback!", "Your review has been published successfully.");
}

let toastTimer = null;
function showToast(title, description) {
  let toast = document.getElementById('review-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'review-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML =
      '<div class="review-toast-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' +
      '<div><span class="review-toast-title"></span><span class="review-toast-desc"></span></div>';
    document.body.appendChild(toast);
  }
  toast.querySelector('.review-toast-title').textContent = title;
  toast.querySelector('.review-toast-desc').textContent = description;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
}

let progress = 0;
const fill = document.getElementById('load-bar-fill');
const percentEl = document.getElementById('load-percent');

const loadInterval = setInterval(() => {
  progress = Math.min(progress + 4, 100);
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
        loadReviews();
        Auth.render();
      }, 400);
    }, 200);
  }
}, 25);

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

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

document.getElementById('year').textContent = new Date().getFullYear();