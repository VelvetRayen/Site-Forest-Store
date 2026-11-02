let currentLang = localStorage.getItem('forest_lang') || 'en';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('forest_lang', lang);

  const htmlRoot = document.getElementById('html-root');
  if (htmlRoot) {
    if (lang === 'ar') {
      htmlRoot.setAttribute('dir', 'rtl');
      htmlRoot.setAttribute('lang', 'ar');
    } else {
      htmlRoot.setAttribute('dir', 'ltr');
      htmlRoot.setAttribute('lang', 'en');
    }
  }

  const langText = document.getElementById('lang-text');
  const langTextM = document.getElementById('lang-text-m');
  if(langText) langText.textContent = lang === 'en' ? 'AR' : 'EN';
  if(langTextM) langTextM.textContent = lang === 'en' ? 'AR' : 'EN';

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    const placeholder = el.getAttribute(`data-${lang}-placeholder`);
    if (placeholder) el.placeholder = placeholder;
  });
}

function toggleLanguage() {
  const newLang = currentLang === 'en' ? 'ar' : 'en';
  applyLanguage(newLang);
}

applyLanguage(currentLang);

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

const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

function setMenuOpen(open){
  menuOpen = open;
  mobileMenu.classList.toggle('open', menuOpen);
  menuBtn.innerHTML = menuOpen
    ? '<i data-lucide="x" style="width:26px;height:26px;"></i>'
    : '<i data-lucide="menu" style="width:26px;height:26px;"></i>';
  if(window.lucide) lucide.createIcons();
}
if(menuBtn) {
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
    if(window.lucide) lucide.createIcons();
  });
  document.addEventListener('click', (e) => {
    if (quickMenu.classList.contains('active') && !quickMenu.contains(e.target) && e.target !== quickBtn) {
      quickMenu.classList.remove('active');
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if(window.lucide) lucide.createIcons();
});
