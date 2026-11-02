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

const PRODUCTS = [
  {
    id: 'bot-custom',
    title: 'Custom Discord Bot',
    category: 'discord',
    subCategory: 'server',
    price: '$15.00',
    badge: 'HOT',
    inStock: true,
    image: 'https://www.vibebot.gg/blog/how-to-make-a-discord-bot.webp',
    icon: 'bot',
    desc: 'Advanced automated moderation, ticket system, custom slash commands, and economy features tailored to your server.',
    features: ['Custom Slash Commands', 'Ticket & Support System', 'Dashboard Integration', '24/7 Uptime Included']
  },
  {
    id: 'discord-nitro',
    title: 'Discord Nitro Boost',
    category: 'discord',
    subCategory: 'profile',
    price: '$4.99',
    badge: 'BEST SELLER',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4lvjBkqvcmMIByMWGNfj_pv2PFiIGuCSZVRSYV_Susw&s=10',
    icon: 'zap',
    desc: 'Upgrade your Discord experience with custom emojis, bigger uploads, HD streaming, and server boosts tailored for your profile.',
    features: ['Global Custom Emojis', '500MB File Uploads', 'HD Video Streaming', 'Includes Server Boosts']
  },
  {
    id: 'server-setup',
    title: 'Full Server Setup & Design',
    category: 'discord',
    subCategory: 'server',
    price: '$20.00',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTix0kCEg2O4B279QASR9zOaX65KJMmrbREMLSMVD2Z5Q&s',
    icon: 'layout',
    desc: 'Complete high-end aesthetic server build, clean channel structure, automated permissions, roles, and security bots.',
    features: ['Aesthetic Layout & Emojis', 'Role Hierarchy & Permissions', 'Security Anti-Nuke System', 'Automated Welcome Message']
  },
  {
    id: 'discord-aged-accounts',
    title: 'Aged Discord Accounts (2016-2020)',
    category: 'discord',
    subCategory: 'profile',
    price: '$3.99',
    badge: 'TRUSTED',
    inStock: false,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTix0kCEg2O4B279QASR9zOaX65KJMmrbREMLSMVD2Z5Q&s',
    icon: 'shield',
    desc: 'Old verified Discord accounts ranging from 2016 to 2020, perfect for high-trust server participation and avoiding automated filters.',
    features: ['Aged Years (2016-2020)', 'Email Verified', 'Phone Unlinked / Clean', 'Instant Delivery']
  },
  {
    id: 'discord-nitro-gift',
    title: 'Discord Nitro Gift Link',
    category: 'discord',
    subCategory: 'profile',
    price: '$4.99',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4lvjBkqvcmMIByMWGNfj_pv2PFiIGuCSZVRSYV_Susw&s=10',
    icon: 'zap',
    desc: 'Full Discord Nitro subscription link with all premium perks including custom emojis, HD streaming, and 500MB uploads.',
    features: ['Full Nitro Perks', 'Gift Link Activation', 'Safe & Secure', 'Instant Delivery']
  },
  {
    id: 'server-boosts-direct',
    title: 'Direct Server Boosts',
    category: 'discord',
    subCategory: 'server',
    price: '$2.50',
    badge: 'BEST VALUE',
    inStock: true,
    image: 'https://gocdkeys.fr/assets/thumbnails/discord-server-boost-pc-cd-key-2.webp',
    icon: 'rocket',
    desc: 'High-quality server boosts delivered directly to your Discord community to unlock premium level perks instantly.',
    features: ['Unlock Level 3 Perks', 'Custom Vanity URL Ready', 'Stable & Safe Boosts', 'Fast Execution']
  },
  {
    id: 'discord-profile-effects',
    title: 'Discord Profile Effects & Decoration',
    category: 'discord',
    subCategory: 'profile',
    price: '$3.50',
    badge: 'NEW',
    inStock: true,
    image: 'https://gocdkeys.fr/assets/thumbnails/discord-server-boost-pc-cd-key-2.webp',
    icon: 'sparkles',
    desc: 'Exclusive animated profile effects and avatar decorations to make your Discord profile stand out from the crowd.',
    features: ['Animated Profile Effects', 'Unique Decorations', 'Compatible with All Themes', 'Instant Setup']
  },
  {
    id: 'bot-hosting',
    title: '24/7 Discord Bot Hosting',
    category: 'discord',
    subCategory: 'server',
    price: '$3.50',
    badge: 'NEW',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    icon: 'server',
    desc: 'High-performance Node.js / Python bot hosting with 99.9% uptime, web panel control, and low latency.',
    features: ['99.9% High Availability', 'Node.js & Python Support', 'Custom Web Control Panel', 'Auto-Restart & DDoS Shield']
  },

  {
    id: 'tiktok-coins',
    title: 'TikTok Coins Recharge',
    category: 'app',
    price: '$5.00',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://www.redsocial.com/wp-content/uploads/2024/10/tiktok-coins-calculator-768x596.webp',
    icon: 'video',
    desc: 'Instant recharge for TikTok coins to support your favorite creators, send live gifts, and boost your channel visibility safely.',
    features: ['Instant Delivery', 'Secure Direct Top-up', 'Support All Regions', '24/7 Live Assistance']
  },
  {
    id: 'usdt-crypto',
    title: 'USDT Crypto Exchange',
    category: 'app',
    price: '$10.00',
    badge: 'FAST',
    inStock: false,
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80',
    icon: 'coins',
    desc: 'Fast and secure USDT cryptocurrency transfer and exchange services with low transaction fees and absolute reliability.',
    features: ['Low Transfer Fees', 'TRC20 & ERC20 Networks', 'Instant Wallet Deposit', 'Secure Transaction']
  },
  {
    id: 'azar-gems',
    title: 'Azar Gems Recharge',
    category: 'app',
    price: '$4.99',
    badge: 'HOT',
    inStock: true,
    image: 'https://mir-s3-cdn-cf.behance.net/projects/404/b945d2199138373.Y3JvcCw4OTXsNzAxLDUzLDA.png',
    icon: 'gem',
    desc: 'Top up Azar gems instantly to unlock premium discovery features, special filters, and enhance your live video chatting experience.',
    features: ['Instant Account Credit', 'Safe & Official Top-up', 'Unlock Premium Filters', 'Global Server Support']
  },

  {
    id: 'youtube-ad',
    title: 'YouTube Sponsored Ad',
    category: 'media',
    price: '$20.00',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://swello.com/fr/blog/wp-content/uploads/2020/09/youtube-ads.png',
    icon: 'video',
    desc: 'Reach your target audience effectively with professional YouTube sponsored advertisements and high conversion rates.',
    features: ['Targeted Audience Reach', 'High Conversion Rates', 'Performance Analytics', 'Campaign Optimization']
  },
  {
    id: 'facebook-ad',
    title: 'Facebook Sponsored Ad',
    category: 'media',
    price: '$18.00',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://bs-uploads.toptal.io/blackfish-uploads/components/blog_post_page/8251604/cover_image/retina_1708x683/Untitled-4ed518aa15e0be5015ec7c56b85ae0d2.png',
    icon: 'share-2',
    desc: 'Boost your brand awareness and generate leads with targeted ad campaigns tailored for Facebook users.',
    features: ['Precise Demographic Targeting', 'Custom Ad Creatives', 'Lead Generation Setup', 'Detailed ROI Reports']
  },
  {
    id: 'website-traffic',
    title: 'Website Traffic',
    category: 'media',
    price: '$10.00',
    badge: 'NEW',
    inStock: false,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    icon: 'globe',
    desc: 'Drive real, organic visitors to your website to increase engagement, visibility, and search rankings.',
    features: ['Real Visitor Traffic', 'Geo-Targeting Options', 'Safe & Reliable Delivery', 'Analytics Tracking']
  },
  {
    id: 'badge-verification',
    title: 'Badge Verification',
    category: 'media',
    price: '$25.00',
    badge: 'PRO',
    inStock: false,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs5DB_n_MOtjjFIa9iR-ScM5gezPQ2IQJAC9Jpm6kvxswY1139X1sRq-0&s=10',
    icon: 'check-circle',
    desc: 'Enhance your profile credibility and establish authenticity with professional badge verification assistance.',
    features: ['Enhanced Credibility', 'Authenticity Proof', 'Priority Support', 'Secure Process']
  },
  {
    id: 'chatgpt-premium',
    title: 'ChatGPT Premium',
    category: 'media',
    price: '$12.00',
    badge: 'HOT',
    inStock: true,
    image: 'https://www.internetmatters.org/wp-content/uploads/2025/06/Chat-GPT-logo.webp',
    icon: 'cpu',
    desc: 'Unlock advanced AI capabilities, faster response times, and priority access to cutting-edge features.',
    features: ['Faster Response Times', 'Advanced AI Models', 'Priority Feature Access', 'Enhanced Productivity']
  },
  {
    id: 'canva-pro',
    title: 'Canva Pro',
    category: 'media',
    price: '$8.00',
    badge: 'BEST VALUE',
    inStock: true,
    image: 'https://www.cdiscount.com/pdt2/4/2/5/1/700x700/aabdj49425/rw/canva-pro--logiciel-de.jpg',
    icon: 'image',
    desc: 'Access premium design tools, millions of stock assets, background remover, and brand kits for your projects.',
    features: ['Millions of Premium Assets', 'One-Click Background Remover', 'Brand Kit Management', 'Unlimited Storage']
  },
  {
    id: 'social-insta',
    title: 'Instagram Growth Pack',
    category: 'media',
    price: '$3.00',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://martech.org/wp-content/uploads/2016/12/instagram-logo-gradient3-ss-1920.jpg',
    icon: 'instagram',
    desc: 'Boost your Instagram presence with high-quality followers, story and shorts views, and engagement likes.',
    features: ['Real Active Followers', 'Story & Shorts Views', 'Instant Engagement Likes', 'Safe & Secure Delivery']
  },
  {
    id: 'social-youtube',
    title: 'YouTube Creator Bundle',
    category: 'media',
    price: '$5.00',
    badge: 'HOT',
    inStock: true,
    image: 'https://www.presse-citron.net/app/uploads/2020/02/youtube.jpg',
    icon: 'youtube',
    desc: 'Expand your channel reach with organic subscribers, high-retention video and shorts views, and likes.',
    features: ['Subscribers Growth', 'Video & Shorts Views', 'High-Retention Watchtime', 'Likes for Videos & Shorts']
  },
  {
    id: 'social-kick',
    title: 'Kick Stream Accelerator',
    category: 'media',
    price: '$4.00',
    badge: 'NEW',
    inStock: true,
    image: 'https://media.es.wired.com/photos/63f416e5bc755c9a2a93f708/3:2/w_3000,h_2000,c_limit/kick%20streaming%20plataforma.jpg',
    icon: 'video',
    desc: 'Supercharge your Kick channel with targeted followers and views for your clips, videos, and live streams.',
    features: ['Channel Followers', 'Clip & Video Views', 'Live Stream Viewers', 'High Engagement Rate']
  },
  {
    id: 'social-twitch',
    title: 'Twitch Channel Booster',
    category: 'media',
    price: '$4.50',
    badge: 'TRENDING',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_92bRiQE-0tH06JTbh8oPLGTAjCtthE--KYIYii_fKGYsR-4ifFyZEl1r&s=10',
    icon: 'tv',
    desc: 'Grow your Twitch community with loyal followers and reliable views for your clips and live broadcasts.',
    features: ['Followers Growth', 'Clip Views & Highlights', 'Live Stream Viewers', 'Organic Appearance']
  },
  {
    id: 'social-bigo',
    title: 'Bigo Live Stream Views',
    category: 'media',
    price: '$6.00',
    badge: 'SPECIAL',
    inStock: true,
    image: 'https://viraltalent.co.uk/wp-content/uploads/2023/09/BIGO-LIVE.png',
    icon: 'radio',
    desc: 'Enhance your Bigo Live broadcast visibility with flexible live stream view durations ranging from 5 to 360 minutes.',
    features: ['Custom Duration (5m - 360m)', 'Active Live Viewers', 'Boost Algorithmic Reach', 'Instant Start']
  },
  {
    id: 'social-linkedin',
    title: 'LinkedIn Premium Business',
    category: 'media',
    price: '$12.00',
    badge: 'PRO',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu58iPeDkX-wEP_aMFU_Y6sWVsA_VSASMY-SK8Xa7M5eOdrZwDqE95WIfr&s=10',
    icon: 'briefcase',
    desc: 'Unlock powerful networking tools and business features with a 6-month LinkedIn Premium Business subscription.',
    features: ['6 Months Full Access', 'InMail Credits Included', 'Who Viewed Your Profile', 'Advanced Business Insights']
  },

  {
    id: 'ff-diamonds',
    title: 'Free Fire Diamonds',
    category: 'gaming',
    price: '$5.00',
    badge: 'BEST SELLER',
    inStock: true,
    image: 'https://livecards.net/i/51956.jpeg?v=0',
    icon: 'gem',
    desc: 'Instant ID top-up for Garena Free Fire diamonds directly into your account with 100% security.',
    features: ['Instant Direct ID Top-up', '100% Safe & Guaranteed', 'Bonus Diamonds Included', 'Global / MENA Supported']
  },
  {
    id: 'recharge-pubg',
    title: 'PUBG Mobile UC',
    category: 'gaming',
    price: 'From $3.00',
    badge: 'BEST VALUE',
    inStock: true,
    image: 'https://amazing.tn/uploads/products/2026/06/be977f44-bf32-4849-aca9-e992d6aa85c0.jpg',
    icon: 'gamepad-2',
    desc: 'Get your PUBG Mobile Unknown Cash (UC) instantly to unlock Royale Pass, weapon skins, and crates.',
    features: ['Direct Player ID Transfer', 'Safe & Legal Method', 'Instant Delivery', 'Bonus UC on Selected Packs']
  },
  {
    id: 'recharge-efootball',
    title: 'eFootball Coins',
    category: 'gaming',
    price: 'From $2.50',
    badge: 'HOT',
    inStock: true,
    image: 'https://cdn.epinium.net/v2/epinium/foxepin.net/Category/44deb788-35a3-435f-84d9-5c41712ffeeb/eFootball%20Coin-logo.webp',
    icon: 'dribbble',
    desc: 'Top up eFootball coins to sign epic players, build your dream squad, and dominate the matches.',
    features: ['Fast Account Crediting', 'Secure Transaction', 'Best Market Rates', 'All Platforms Supported']
  },
  {
    id: 'recharge-bloodstrike',
    title: 'Blood Strike Gold',
    category: 'gaming',
    price: 'From $2.00',
    badge: 'NEW',
    inStock: true,
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3199170/eeab00314314192f57bbdf91b91f8b871f890ce5/capsule_616x353.jpg?t=1788924245',
    icon: 'crosshair',
    desc: 'Recharge Blood Strike gold instantly to purchase operators, weapons, and battle passes.',
    features: ['Instant In-Game Delivery', 'Secure & Fast', 'Direct ID Recharge', '24/7 Availability']
  },
  {
    id: 'recharge-roblox',
    title: 'Roblox Robux',
    category: 'gaming',
    price: 'From $4.99',
    badge: 'TRENDING',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-fWlmX2KRTZfBUnbkbhm98gKLdLtPxmdAaxI3DupU55XHUyPtSx2Kyj4&s=10',
    icon: 'box',
    desc: 'Get Roblox Robux to customize your avatar, buy game passes, and unlock exclusive items in your favorite games.',
    features: ['Instant Code / Transfer', 'Safe Methods', 'All Amounts Available', 'Official Gift Cards & Direct']
  },
  {
    id: 'gta-key',
    title: 'GTA V Premium Edition Key',
    category: 'gaming',
    price: '$14.00',
    badge: null,
    inStock: true,
    image: 'https://thumb.wikimedia.org/wikipedia/fr/thumb/d/d5/Grand_Theft_Auto_V_Logo.svg/1280px-Grand_Theft_Auto_V_Logo.svg.png?utm_source=fr.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
    icon: 'key',
    desc: 'Official digital license code for GTA V including Criminal Enterprise Starter Pack for Rockstar / PC.',
    features: ['Global Digital Code', 'Full GTA Online Access', '$1,000,000 In-game Cash', 'Instant Delivery']
  },

  {
    id: 'netflix-sub',
    title: 'Premium Netflix Subscription',
    category: 'subs',
    price: '$4.00',
    badge: 'NEW',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80',
    icon: 'tv',
    desc: '4K Ultra HD private screen Netflix membership with full warranty and uninterrupted stream access.',
    variants: [
      { title: '1 Month Basic', price: '16 TND', originalPrice: '20 TND' },
      { title: '1 Month Standard', price: '32 TND', originalPrice: '40 TND' },
      { title: '1 Month Premium', price: '39 TND', originalPrice: '50 TND' }
    ],
    features: ['4K UHD Quality', 'Full Duration Warranty', 'Private Screen Profile', 'Instant Login Details']
  },
  {
    id: 'spotify-sub',
    title: 'Spotify Premium (1 Year)',
    category: 'subs',
    price: '$12.00',
    badge: 'BEST SELLER',
    inStock: true,
    image: 'https://sm.pcmag.com/t/pcmag_me/review/s/spotify/spotify_wc7u.1200.png',
    icon: 'music',
    desc: 'Enjoy ad-free music playback, unlimited offline downloads, and high-fidelity audio on your personal account.',
    features: ['Personal Account Upgrade', 'No Advertisements', 'Offline Song Downloads', '12 Months Guaranteed']
  },
  {
    id: 'shahid-vip-sub',
    title: 'Shahid VIP Premium',
    category: 'subs',
    price: '15 TND',
    badge: 'POPULAR',
    inStock: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1pQAOtuMXC-xUmwhHKk6XtVN-w5wzJd4Opo7OHXG3nWqnWE-NKDXtDjfY&s=10',
    icon: 'tv-2',
    desc: 'Accès illimité aux contenus exclusifs Shahid VIP, séries arabes, films et chaînes en direct sans publicité.',
    variants: [
      { title: '1 Mois VIP', price: '15 TND', originalPrice: '20 TND' },
      { title: '3 Mois VIP', price: '38 TND', originalPrice: '50 TND' },
      { title: '12 Mois VIP', price: '110 TND', originalPrice: '140 TND' }
    ],
    features: ['Full HD / 4K Stream', 'Sans Publicité', 'Garantie Totale', 'Livraison Immédiate']
  },
  {
    id: 'prime-video-sub',
    title: 'Amazon Prime Video',
    category: 'subs',
    price: '12 TND',
    badge: 'HOT',
    inStock: true,
    image: 'https://m.media-amazon.com/images/G/01/primevideo/seo/primevideo-seo-logo.png',
    icon: 'film',
    desc: 'Profitez de films exclusifs, séries Amazon Originals et de contenus en streaming haute qualité avec garantie.',
    variants: [
      { title: '1 Mois Privé', price: '12 TND', originalPrice: '18 TND' },
      { title: '6 Mois Privé', price: '55 TND', originalPrice: '80 TND' },
      { title: '12 Mois Privé', price: '95 TND', originalPrice: '130 TND' }
    ],
    features: ['Qualité 4K Ultra HD', 'Compte Personnel / Profil', 'Téléchargement Hors Ligne', 'Garantie Complète']
  },
  {
    id: 'crunchyroll-sub',
    title: 'Crunchyroll Mega Fan',
    category: 'subs',
    price: '10 TND',
    badge: 'ANIME',
    inStock: true,
    image: 'https://images.g2a.com/300x400/1x1x1/crunchyroll-premium-mega-fan-12-months-crunchyroll-key-global-i10000271997007/7068b74fc76b4b3a9e913205',
    icon: 'sparkles',
    desc: 'Regardez tous vos animes préférés en simulcast juste après le Japon, en HD/4K et sans aucune publicité.',
    variants: [
      { title: '1 Mois Fan', price: '10 TND', originalPrice: '15 TND' },
      { title: '1 Mois Mega Fan', price: '16 TND', originalPrice: '22 TND' },
      { title: '12 Mois Mega Fan', price: '90 TND', originalPrice: '120 TND' }
    ],
    features: ['Streaming Sans Pubs', 'Accès Simulcast (1h après le Japon)', 'Visionnage Hors Ligne', 'Garantie Période Entière']
  }
];

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

const ORDERS_KEY = 'forest_admin_orders';
const INVOICE_LINES_Y = [384, 353, 322];

function selectedItems() {
  if (checkoutMode === 'cart') {
    return Cart.getItems().map(i => ({ title: i.title, variant: i.variant, qty: i.qty, amount: i.amount, currency: i.currency }));
  }
  const checked = document.querySelector('input[name="product_variant"]:checked');
  const variant = checked ? currentSelectedProduct.variants.find(v => v.title === checked.value) : null;
  const parsed = Cart.parsePrice(variant ? variant.price : currentSelectedProduct.price);
  return [{ title: currentSelectedProduct.title, variant: variant ? variant.title : '', qty: 1, amount: parsed.amount, currency: parsed.currency }];
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

function storeOrder(order, factureData) {
  const summary = order.items.map(describeItem).join(', ');
  const record = {
    orderId: order.orderId,
    username: order.invoiceUsername,
    discordId: order.invoiceDiscordId,
    userId: order.customer.userId,
    numero: order.customer.phone,
    email: order.customer.email,
    title: summary,
    price: order.total,
    product: `${summary} - ${order.total}`,
    items: order.items,
    total: order.total,
    payment: order.payment,
    date: order.date,
    factureData
  };
  let orders = [];
  try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (err) {}
  orders.push(record);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    delete record.factureData;
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch (err2) {}
  }
}

async function handleOrderSubmit(e) {
  e.preventDefault();
  if (!requireLogin()) return;
  if (checkoutMode === 'cart' ? !Cart.count() : !currentSelectedProduct) return;

  const usernameInput = document.getElementById('discord-username');
  const idInput = document.getElementById('discord-id');
  const typedUsername = usernameInput ? usernameInput.value.trim() : '';
  const typedId = idInput ? idInput.value.trim() : '';
  const user = Auth.getUser();

  const items = selectedItems().map(i => ({
    title: i.title,
    variant: i.variant,
    qty: i.qty,
    amount: i.amount,
    currency: i.currency,
    price: Cart.formatAmount(i.amount, i.currency),
    lineTotal: Cart.formatAmount(i.amount * i.qty, i.currency)
  }));

  const order = {
    orderId: '#ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleString(),
    payment: document.querySelector('input[name="payment"]:checked').value,
    items,
    total: Cart.totalLabel(items),
    invoiceUsername: typedUsername || 'Client_' + Math.floor(Math.random() * 9000 + 1000),
    invoiceDiscordId: typedId || 'UID_' + Math.floor(Math.random() * 900000 + 100000),
    customer: {
      name: user ? user.name : '',
      userId: user ? user.discordId : '',
      discordUsername: typedUsername,
      discordId: typedId,
      email: document.getElementById('user-email').value,
      phone: document.getElementById('customer-numero').value
    }
  };

  try {
    showToast("Processing...", "Your personal invoice is being prepared and downloaded...");

    const blob = await buildInvoice(order);
    storeOrder(order, await blobToDataUrl(blob));

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Facture_${order.invoiceDiscordId}.pdf`;
    link.click();

    OrderNotifier.send(order);
    if (checkoutMode === 'cart') Cart.clear();

    modal.classList.remove('active');
    showCompletionOptions(order);

  } catch (error) {
    alert("An error occurred while generating the invoice: Ensure that the file 'assets/docs/facture.pdf' exists in the same site folder, then try again.");
  }
}

function showCompletionOptions(order) {
  const storePhone = "+21625310421";
  const userId = order.orderId;
  const product = order.items.map(describeItem).join(", ");
  const price = order.total;
  const payment = order.payment;
  const numero = order.customer.phone;
  const messageText = `مرحباً Forest Store، لقد قمت بطلب:\n- المنتج: ${product}\n- السعر: ${price}\n- الدفع: ${payment}\n- رقم الهاتف: ${numero}\n- معرف الطلب: ${userId}\n\n(لقد قمت بتحميل الفاتورة وسأقوم بإرسالها لكم هنا لإتمام الشراء).`;
  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;
  const discordUrl = "https://discord.gg/akJzbRqeK";

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
  discordUrl: "https://discord.gg/akJzbRqeK"
};

document.querySelectorAll('.server-name, .server-name-inline').forEach(el => el.textContent = SITE_CONFIG.serverName);
document.querySelectorAll('.discord-link').forEach(el => el.href = SITE_CONFIG.discordUrl);

document.getElementById('year').textContent = new Date().getFullYear();

const pendingCheckout = new URLSearchParams(location.search).get('checkout') === '1';
if (pendingCheckout) history.replaceState(null, '', location.pathname);
Cart.onCheckout = openCartCheckout;

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
        if (pendingCheckout) openCartCheckout();
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

