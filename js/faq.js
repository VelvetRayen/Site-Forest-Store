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

document.getElementById('year').textContent = new Date().getFullYear();

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
        if (window.lucide) lucide.createIcons();
        Auth.render();
        initLanguage();
      }, 400);
    }, 200);
  }
}, 30);

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
const translations = {
  en: {
    "nav-home": "Home",
    "nav-rules": "Rules",
    "nav-store": "Store",
    "nav-reviews": "Reviews",
    "nav-faq": "FAQ",
    "login-btn": "Login",
    "faq-badge": "Questions",
    "faq-title": 'Frequently <span class="text-gradient">Asked Questions</span>',
    "faq-subtitle": "We answer the main questions that might be on your mind about our services and products.",
    "footer-desc": "Your premium digital marketplace for gaming and digital products. We provide instant delivery, secure payments, and 24/7 customer support.",
    "footer-quick-links": "Quick Links",
    "footer-support": "Support",
    "footer-about": "About Us",
    "footer-contact": "Contact Us",
    "footer-contact-sub": "Have a question? Send us a message.",
    "btn-send": "Send Message",
    "secure-pay": "Secure Payments",
    "rights": "All rights reserved.",
    "status-online": "Online 24/7",
    "feature-delivery": "Instant Delivery",
    "feature-payment": "Secure Payment",
    "email-placeholder": "Enter your email",
    "msg-placeholder": "Enter your message",
    "loading-subtext": "Frequently Asked Questions",
    "faqs": [
      { q: 'What types of digital products and services do you offer?', a: 'We offer a wide range of digital products including PC & Console games (Steam, Epic, Xbox, PlayStation), streaming subscriptions (Netflix, Spotify), mobile data packages/forfaits, gift cards, software, and Discord services.' },
      { q: 'What types of Discord bots do you develop?', a: 'We develop custom bots tailored to your needs, including moderation, gaming, music, ticketing, verification, economy systems, and third-party API integrations.' },
      { q: 'What types of custom stickers do you design?', a: 'We create exclusive, high-quality stickers including expressive emotes, custom character art, branded community stickers, and tailored server visuals.' },
      { q: 'How long does it take to develop a custom bot?', a: 'Turnaround time depends on project complexity. Standard bots are delivered within a few days, while advanced custom systems may take up to a few weeks.' },
      { q: 'Do you offer hosting services for bots?', a: 'Yes, we provide high-availability, secure 24/7 hosting solutions to ensure your bots remain online and operate seamlessly without interruption.' },
      { q: 'What kind of support is provided post-purchase?', a: 'We provide ongoing technical support. If you encounter any issues, open a ticket on our Discord server and our team will resolve it promptly.' }
    ]
  },
  ar: {
    "nav-home": "الرئيسية",
    "nav-rules": "القوانين",
    "nav-store": "المتجر",
    "nav-reviews": "التقييمات",
    "nav-faq": "الأسئلة الشائعة",
    "login-btn": "تسجيل الدخول",
    "faq-badge": "الأسئلة",
    "faq-title": 'الأسئلة <span class="text-gradient">الشائعة</span>',
    "faq-subtitle": "نجيب على أهم الأسئلة التي قد تدور في ذهنك حول خدماتنا ومنتجاتنا.",
    "footer-desc": "متجرك الرقمي المميز للألعاب والمنتجات الرقمية. نوفر تسليماً فورياً، دفعاً آمناً، ودعماً فنياً على مدار الساعة.",
    "footer-quick-links": "روابط سريعة",
    "footer-support": "الدعم",
    "footer-about": "من نحن",
    "footer-contact": "تواصل معنا",
    "footer-contact-sub": "لديك سؤال؟ أرسل لنا رسالة.",
    "btn-send": "إرسال الرسالة",
    "secure-pay": "دفع آمن",
    "rights": "جميع الحقوق محفوظة.",
    "status-online": "متواجدون 24/7",
    "feature-delivery": "تسليم فوري",
    "feature-payment": "دفع آمن",
    "email-placeholder": "أدخل بريدك الإلكتروني",
    "msg-placeholder": "أدخل رسالتك",
    "loading-subtext": "الأسئلة الشائعة",
    "faqs": [
      { q: 'ما هي أنواع المنتجات والخدمات الرقمية التي تقدمونها؟', a: 'نقدم مجموعة واسعة من المنتجات الرقمية بما في ذلك ألعاب الكمبيوتر والأجهزة (Steam، Epic، Xbox، PlayStation)، اشتراكات البث (Netflix، Spotify)، باقات الإنترنت، بطاقات الهدايا، البرامج، وخدمات الديسكورد.' },
      { q: 'ما هي أنواع بوتات الديسكورد التي تقومون بتطويرها؟', a: 'نقوم بتطوير بوتات مخصصة حسب احتياجاتك، بما في ذلك الإدارة، الألعاب، الموسيقى، التذاكر، التحقق، النظم الاقتصادية، والربط مع الواجهات البرمجية الخارجية.' },
      { q: 'ما هي أنواع الملصقات المخصصة التي تقومون بتصميمها؟', a: 'نحن نصمم ملصقات حصرية عالية الجودة تشمل الإيموجيات التعبيرية، شخصيات مخصصة، ملصقات مجتمعية، وهويات بصرية للسيرفرات.' },
      { q: 'كم من الوقت يستغرق تطوير بوت مخصص؟', a: 'يعتمد وقت التسليم على تعقيد المشروع. يتم تسليم البوتات القياسية خلال أيام قليلة، بينما الأنظمة المتقدمة قد تستغرق بضعة أسابيع.' },
      { q: 'هل تقدمون خدمات استضافة للبوتات؟', a: 'نعم، نوفر حلول استضافة آمنة وعالية الأداء 24/7 لضمان بقاء البوتات متصلة بالإنترنت وعملها دون انقطاع.' },
      { q: 'ما نوع الدعم المقدم بعد الشراء؟', a: 'نوفر دعمًا فنيًا مستمرًا. إذا واجهت أي مشكلة، فقط قم بفتح تذكرة دعم (Ticket) في سيرفر الديسكورد الخاص بنا وسيقوم فريقنا بحلها فورًا.' }
    ]
  }
};

let currentLang = localStorage.getItem('site_lang') || 'en';

function initLanguage() {
  applyLanguage(currentLang);
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem('site_lang', currentLang);
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  const t = translations[lang];
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  const langTextDesktop = document.getElementById('lang-text');
  const langTextMobile = document.getElementById('lang-text-mobile');
  if (langTextDesktop) langTextDesktop.textContent = lang === 'en' ? 'AR' : 'EN';
  if (langTextMobile) langTextMobile.textContent = lang === 'en' ? 'AR' : 'EN';

  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (t[key]) el.innerHTML = t[key];
  });

  const faqTitle = document.getElementById('faq-title');
  if (faqTitle && t["faq-title"]) faqTitle.innerHTML = t["faq-title"];

  const emailInput = document.getElementById('input-email');
  const msgInput = document.getElementById('input-msg');
  if (emailInput) emailInput.placeholder = t["email-placeholder"];
  if (msgInput) msgInput.placeholder = t["msg-placeholder"];

  renderFaqs(t.faqs);
  if (window.lucide) lucide.createIcons();
}

function renderFaqs(faqArray) {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;
  faqList.innerHTML = faqArray.map((f, i) => `
    <div class="faq-item" id="faq-item-${i}">
      <button onclick="toggleFaq(${i})" style="width:100%; padding:20px 24px; background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; text-align:${currentLang === 'ar' ? 'right' : 'left'}; gap:16px;">
        <span style="color:#fff; font-weight:700; font-size:16px; line-height:1.7;">${f.q}</span>
        <i data-lucide="chevron-down" class="faq-chevron" id="faq-chevron-${i}" style="color:var(--green-a); width:20px; height:20px; flex-shrink:0;"></i>
      </button>
      <div class="faq-answer" id="faq-answer-${i}">${f.a}</div>
    </div>
  `).join('');
}

function toggleFaq(i) {
  const answer = document.getElementById('faq-answer-' + i);
  const chevron = document.getElementById('faq-chevron-' + i);
  const item = document.getElementById('faq-item-' + i);
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-chevron').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    chevron.classList.add('open');
    item.classList.add('open');
  }
}

