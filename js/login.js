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
    this.size = Math.random() * 2.2 + 0.4;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.15;
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
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ff52';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function initParticles() {
  particlesArray = [];
  const particleCount = Math.floor((canvas.width * canvas.height) / 20000);
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

document.getElementById('year').textContent = new Date().getFullYear();

let progress = 0;
const fill = document.getElementById('load-bar-fill');
const percentEl = document.getElementById('load-percent');
const loadInterval = setInterval(() => {
  progress = Math.min(progress + 6, 100);
  fill.style.width = progress + '%';
  percentEl.textContent = progress + '%';
  if (progress >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      const ls = document.getElementById('loading-screen');
      ls.style.opacity = '0';
      setTimeout(() => {
        ls.style.display = 'none';
        document.getElementById('site').style.display = 'flex';
        if (window.lucide) lucide.createIcons();
      }, 400);
    }, 150);
  }
}, 20);

const DISCORD_CLIENT_ID = "1553131920823689226";

function newOAuthState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const state = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem('forest_oauth_state', state);
  return state;
}

function handleDiscordLogin() {
  Auth.rememberNext();
  const currentRedirectUri = window.location.origin + window.location.pathname;
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(currentRedirectUri)}&scope=identify+email&state=${newOAuthState()}`;
  window.location.href = discordAuthUrl;
}

(function checkDiscordCallback() {
  const hash = window.location.hash;

  if (!hash.includes("access_token") && Auth.isLoggedIn()) {
    Auth.rememberNext();
    window.location.replace(Auth.consumeNext());
    return;
  }
  if (hash && hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const expectedState = sessionStorage.getItem('forest_oauth_state');
    sessionStorage.removeItem('forest_oauth_state');
    window.history.replaceState({}, document.title, window.location.pathname);

    if (!accessToken || !expectedState || params.get("state") !== expectedState) {
      showToast("Login could not be verified. Please try again.", "error");
      return;
    }

    showToast("Connecting with Discord...", "info");
    Auth.request('/api/auth/discord', { method: 'POST', body: { accessToken } })
      .then(res => {
        if (!res.ok || !res.data.token) {
          showToast(res.data.error || "Discord connection failed.", "error");
          return;
        }
        Auth.setSession(res.data.token, res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, "success");
        setTimeout(() => { window.location.href = Auth.consumeNext(); }, 1500);
      })
      .catch(() => showToast("Server unreachable. It may be waking up, try again in a moment.", "error"));
  }
})();

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');
  const toastIcon = document.getElementById('toast-icon');

  if (type === 'error') {
    toast.style.borderColor = '#ef4444';
    toastIcon.style.color = '#ef4444';
    toastIcon.setAttribute('data-lucide', 'alert-circle');
    toastTitle.textContent = 'Error';
  } else if (type === 'info') {
    toast.style.borderColor = '#3b82f6';
    toastIcon.style.color = '#3b82f6';
    toastIcon.setAttribute('data-lucide', 'info');
    toastTitle.textContent = 'Notice';
  } else {
    toast.style.borderColor = 'var(--green-a)';
    toastIcon.style.color = 'var(--green-a)';
    toastIcon.setAttribute('data-lucide', 'check-circle-2');
    toastTitle.textContent = 'Success';
  }

  toastDesc.textContent = message;
  if (window.lucide) lucide.createIcons();

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
