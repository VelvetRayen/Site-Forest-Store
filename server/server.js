require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createOrderHandler, createRateLimiter, isValidWebhookUrl } = require('./webhook');

const app = express();
app.use(express.json());
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));
app.use(cors(ALLOWED_ORIGINS.length ? { origin: ALLOWED_ORIGINS } : undefined));

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!ADMIN_API_KEY) {
  console.error('Missing ADMIN_API_KEY in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!ADMIN_PASSWORD) {
  console.error('Missing ADMIN_PASSWORD in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI);

const productSchema = new mongoose.Schema({
  id: String,
  title: String,
  category: String,
  subCategory: String,
  price: String,
  badge: String,
  inStock: Boolean,
  image: String,
  icon: String,
  desc: String,
  features: [String],
  variants: [
    {
      title: String,
      price: String,
      originalPrice: String,
    }
  ]
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
  discordId: { type: String, unique: true, required: true },
  username: String,
  globalName: String,
  avatar: String,
  lastLogin: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid x-api-key header' });
  }
  next();
}

const crypto = require('crypto');
function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  if (now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    entry.count = 0;
    entry.firstAttempt = now;
  }
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }

  const { password } = req.body || {};
  const ok = typeof password === 'string' && safeCompare(password, ADMIN_PASSWORD);

  entry.count += 1;
  loginAttempts.set(ip, entry);

  if (!ok) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  loginAttempts.delete(ip);
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, expiresIn: '12h' });
});

function requireAdminAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: missing admin session token' });
  }
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid, please log in again' });
  }
}

app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  res.json({ ok: true });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/seed', requireApiKey, async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = await Product.insertMany(req.body);
    res.json({ message: "Products Added Successfully!", products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/sync', async (req, res) => {
  try {
    const { discordId, username, globalName, avatar } = req.body;
    if (typeof discordId !== 'string' || !discordId) return res.status(400).json({ error: 'Discord ID is required' });

    const user = await User.findOneAndUpdate(
      { discordId },
      { username, globalName, avatar, lastLogin: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/block', requireAdminAuth, async (req, res) => {
  try {
    const { discordId, isBlocked } = req.body;
    await User.findOneAndUpdate({ discordId }, { isBlocked });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (!isValidWebhookUrl(DISCORD_WEBHOOK_URL)) {
  console.warn('DISCORD_WEBHOOK_URL is missing or invalid: POST /api/orders will answer 503 until it is set.');
}

app.post('/api/orders', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 }), createOrderHandler({ webhookUrl: DISCORD_WEBHOOK_URL }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
