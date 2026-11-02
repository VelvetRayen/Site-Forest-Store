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

const SITE_CONFIG = {
  serverName: "Forest Store",
  logoUrl: "assets/img/logo.png",
  discordUrl: "https://discord.gg/akJzbRqeK"
};

document.title = SITE_CONFIG.serverName + " | Forest Store Premier Digital Marketplace";
document.querySelectorAll('.server-name, .server-name-inline').forEach(el => {
  el.textContent = SITE_CONFIG.serverName;
});
document.querySelectorAll('.discord-link').forEach(el => {
  el.href = SITE_CONFIG.discordUrl;
});

document.querySelectorAll('.server-logo-slot').forEach(el => {
  if (SITE_CONFIG.logoUrl) {
    const img = document.createElement('img');
    img.src = SITE_CONFIG.logoUrl;
    img.alt = SITE_CONFIG.serverName;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.onerror = () => {
      el.style.background = 'linear-gradient(135deg, #00ff52, #15803d)';
      el.textContent = SITE_CONFIG.serverName.charAt(0).toUpperCase();
    };
    el.appendChild(img);
  } else {
    el.style.background = 'linear-gradient(135deg, #00ff52, #15803d)';
    el.textContent = SITE_CONFIG.serverName.charAt(0).toUpperCase();
  }
});
document.getElementById('year').textContent = new Date().getFullYear();

let progress = 0;
const fill = document.getElementById('load-bar-fill');
const percentEl = document.getElementById('load-percent');
const loadInterval = setInterval(() => {
  progress = Math.min(progress + 2, 100);
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
        setLanguage(currentLang);
        Auth.render();
      }, 400);
    }, 250);
  }
}, 40);

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;
function setMenuOpen(open){
  menuOpen = open;
  mobileMenu.classList.toggle('open', menuOpen);
  menuBtn.innerHTML = menuOpen
    ? '<i data-lucide="x" style="width:26px;height:26px;"></i>'
    : '<i data-lucide="menu" style="width:26px;height:26px;"></i>';
  if (window.lucide) lucide.createIcons();
}
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

function applyResponsive() {
  const wide = window.innerWidth >= 900;
  const featuresGrid = document.getElementById('features-grid');
  const servicesGrid = document.getElementById('services-grid');
  const stepsGrid = document.getElementById('steps-grid');
  const aboutGrid = document.getElementById('about-grid');

  if(featuresGrid) featuresGrid.style.gridTemplateColumns = wide ? 'repeat(3,1fr)' : (window.innerWidth >= 600 ? 'repeat(2,1fr)' : '1fr');
  if(servicesGrid) servicesGrid.style.gridTemplateColumns = wide ? 'repeat(3,1fr)' : (window.innerWidth >= 600 ? 'repeat(2,1fr)' : '1fr');
  if(stepsGrid) stepsGrid.style.gridTemplateColumns = wide ? 'repeat(3,1fr)' : (window.innerWidth >= 600 ? 'repeat(2,1fr)' : '1fr');
  if(aboutGrid) aboutGrid.style.gridTemplateColumns = wide ? 'repeat(2,1fr)' : '1fr';
}
applyResponsive();
window.addEventListener('resize', applyResponsive);

let wordIndex = 0, charIndex = 0, isDeleting = false;
const targetElement = document.getElementById("typed-text");

function typeEffect() {
  if(!targetElement) return;
  const wordsList = translations[currentLang].words;
  const currentWord = wordsList[wordIndex % wordsList.length];
  if (isDeleting) {
    targetElement.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    targetElement.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 60 : 120;
  if (!isDeleting && charIndex === currentWord.length) {
    speed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % wordsList.length;
    speed = 500;
  }
  setTimeout(typeEffect, speed);
}
document.addEventListener("DOMContentLoaded", typeEffect);

document.addEventListener("DOMContentLoaded", () => {
  const statsSection = document.getElementById("stats-counter-section");
  const statNumbers = document.querySelectorAll(".stat-number");
  let animated = false;

  const animateNumbers = () => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    statNumbers.forEach(num => {
      const target = parseInt(num.getAttribute("data-target"), 10);
      const format = num.getAttribute("data-format");
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(target * easeOutQuad);

        if (format === "k") {
          num.textContent = currentValue >= 1000 ? (currentValue / 1000).toFixed(1) + "k" : currentValue;
        } else {
          num.textContent = currentValue;
        }

        if (frame === totalFrames) {
          clearInterval(counter);
          num.textContent = format === "k" ? (target / 1000) + "k" : target;
        }
      }, frameRate);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateNumbers();
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) observer.observe(statsSection);
});
