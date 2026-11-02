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

let currentMethod = 'ooredoo';

function selectMethod(method) {
  if (currentMethod === method) return;
  currentMethod = method;

  const cards = document.querySelectorAll('.method-card');
  cards.forEach(card => {
    if(card.getAttribute('data-id') === method) {
      card.style.background = 'rgba(0,255,82,0.08)';
      card.style.borderColor = 'rgba(0,255,82,0.4)';
      card.querySelector('h4').style.color = '#fff';
      card.querySelector('span').style.color = '#00ff52';
      card.style.transform = 'scale(1.03)';
      setTimeout(() => card.style.transform = 'scale(1)', 200);
    } else {
      card.style.background = 'rgba(255,255,255,0.03)';
      card.style.borderColor = 'rgba(255,255,255,0.08)';
      card.querySelector('h4').style.color = '#fff';
      card.querySelector('span').style.color = '#9ca3af';
      card.style.transform = 'scale(1)';
    }
  });

  const calcBody = document.getElementById('calculator-body');
  calcBody.classList.remove('animate-transition');
  void calcBody.offsetWidth;
  calcBody.classList.add('animate-transition');

  const inputLabel = document.getElementById('input-label');
  const inputUnit = document.getElementById('input-unit');
  const resultLabel = document.getElementById('result-label');

  if (method === 'ooredoo') {
    inputLabel.textContent = 'Enter Amount (DT)';
    inputUnit.textContent = 'DT';
    resultLabel.textContent = 'Total Tax Amount';
  } else if (method === 'd17') {
    inputLabel.textContent = 'Enter Amount (DT)';
    inputUnit.textContent = 'DT';
    resultLabel.textContent = 'Total Tax Amount';
  } else if (method === 'binance') {
    inputLabel.textContent = 'Enter Amount (USDT)';
    inputUnit.textContent = 'USDT';
    resultLabel.textContent = 'Equivalent in TND';
  } else if (method === 'probot') {
    inputLabel.textContent = 'Enter Amount (DT)';
    inputUnit.textContent = 'K';
    resultLabel.textContent = 'Total with Probot Fee';
  }

  calculate();
}

function calculate() {
  const val = parseFloat(document.getElementById('calc-amount').value);
  const resultEl = document.getElementById('result-output');

  if (isNaN(val) || val <= 0) {
    resultEl.textContent = "0.00 " + (currentMethod === 'binance' ? 'TND' : 'DT');
    return;
  }

  let finalVal = 0;
  if (currentMethod === 'ooredoo') {
    finalVal = val / 0.75;
    resultEl.textContent = finalVal.toFixed(2) + " DT";
  } else if (currentMethod === 'd17') {
    finalVal = val / 0.98;
    resultEl.textContent = finalVal.toFixed(2) + " DT";
  } else if (currentMethod === 'binance') {
    finalVal = val * 3.6;
    resultEl.textContent = finalVal.toFixed(2) + " TND";
  } else if (currentMethod === 'probot') {
    finalVal = val + (val * 0.053);
    resultEl.textContent = finalVal.toFixed(2) + " k";
  }
}

function setAmount(val) {
  document.getElementById('calc-amount').value = val;
  calculate();
}

function copyResult() {
  const text = document.getElementById('result-output').innerText;
  navigator.clipboard.writeText(text);

  const toast = document.getElementById('toast-notification');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

let progress = 0;
const fill = document.getElementById('load-bar-fill');
const percentEl = document.getElementById('load-percent');

const loadInterval = setInterval(() => {
  progress = Math.min(progress + 5, 100);
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
      }, 400);
    }, 200);
  }
}, 25);

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
document.getElementById('year').textContent = new Date().getFullYear();
if (window.lucide) lucide.createIcons();
