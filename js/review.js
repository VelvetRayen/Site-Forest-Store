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

const DEFAULT_REVIEWS = [
  {
    name: 'Karim',
    role: 'Verified Buyer',
    product: 'Free Fire Diamonds',
    text: 'Service Top! Chrit Tak Tak Diamond free fire',
    rating: 5,
    date: '4 days ago'
  },
  {
    name: 'Nafa33',
    role: 'Server Owner',
    product: 'Custom Bot & Server Setup',
    text: 'Berasmi Chabeb S7i7 5dhe Wa9et chwaya server ama brojla haja tayara ynadhmoulk kol chy enty barka twlha b server bt3k maykhaloulk chy bch taemlou enty',
    rating: 4,
    date: '5 days ago'
  },
  {
    name: 'Dex',
    role: 'Verified Buyer',
    product: 'Netflix',
    text: 'Awel Mara net3amel M3ahom chrit compte netflix jwhom bhy',
    rating: 5,
    date: '6 days ago'
  },
  {
    name: '! ☈ | SIGMA',
    role: 'Gamer',
    product: 'PUBG UC Pack',
    text: 'ثقة وسرعة في التسليم، شحنت pubg ',
    rating: 5,
    date: '1 week ago'
  },
  {
    name: 'Mouhamed ali',
    role: 'Client • Gamer',
    product: 'Free Fire Diamonds',
    text: 'Top  ',
    rating: 5,
    date: 'Today'
  },
  {
    name: 'Ahmed B.',
    role: 'Client • Server Owner',
    product: 'Custom Discord Bot',
    text: 'chrit bot systeme ',
    rating: 4,
    date: 'Yesterday'
  },
  {
    name: 'Sami T.',
    role: 'Client • VIP Member',
    product: 'Spotify Premium',
    text: 'mou9aratan b nes lokhra aswemhom bhya',
    rating: 5,
    date: '3 days ago'
  }
];

function getStoredReviews() {
  const stored = localStorage.getItem('forest_store_reviews.v2');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return DEFAULT_REVIEWS; }
  }
  localStorage.setItem('forest_store_reviews.v2', JSON.stringify(DEFAULT_REVIEWS));
  return DEFAULT_REVIEWS;
}

function renderReviews() {
  const reviews = getStoredReviews();
  const container = document.getElementById('reviews-container');
  document.getElementById('review-count').textContent = reviews.length;

  container.innerHTML = reviews.map(r => `
    <div class="card-hover" style="background:rgba(255,255,255,.02); border:1px solid rgba(0,255,82,.2); border-radius:18px; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:12px; fill:var(--green-a); background:linear-gradient(135deg, var(--green-a), var(--green-c)); display:flex; align-items:center; justify-content:center; color:#000; font-weight:900; font-size:16px;">
              ${r.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style="color:#fff; font-size:15px; font-weight:800; margin:0;">${r.name}</h4>
              <span style="color:var(--green-a); font-size:11px; font-weight:700;">${r.role}</span>
            </div>
          </div>
          <span style="color:#ffc107; font-size:14px; font-weight:bold;">${'★'.repeat(r.rating)}</span>
        </div>

        <div style="background:rgba(0,255,82,.05); border:1px solid rgba(0,255,82,.1); padding:6px 12px; border-radius:8px; display:inline-block; margin-bottom:12px;">
          <span style="color:#9ca3af; font-size:11px;">Purchased: </span>
          <strong style="color:#fff; font-size:12px;">${r.product}</strong>
        </div>

        <p style="color:#d1d5db; font-size:13.5px; line-height:1.6; margin:0 0 12px;">"${r.text}"</p>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,.05); padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#6b7280;">
        <span><i data-lucide="check-circle-2" style="width:12px; height:12px; color:var(--green-a); display:inline;"></i> Verified Buyer</span>
        <span>${r.date || 'Recently'}</span>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

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

function submitNewReview(e) {
  e.preventDefault();

  const name = document.getElementById('rev-name').value.trim();
  const role = document.getElementById('rev-role').value;
  const product = document.getElementById('rev-product').value.trim();
  const text = document.getElementById('rev-text').value.trim();

  if(!name || !product || !text) return;

  const newRev = {
    name: name,
    role: role,
    product: product,
    text: text,
    rating: currentSelectedStars,
    date: "Just now"
  };

  const reviews = getStoredReviews();
  reviews.unshift(newRev);
  localStorage.setItem('forest_store_reviews.v2', JSON.stringify(reviews));

  document.getElementById('review-form').reset();
  currentSelectedStars = 5;
  starIcons.forEach(s => s.style.color = '#ffc107');

  renderReviews();
  alert("Takyiimak tzad fel page b-naja7! Chokran 3la rayek.");
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
        renderReviews();
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

