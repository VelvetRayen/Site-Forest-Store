require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sendOrderNotification, isValidWebhookUrl, createRateLimiter } = require('./webhook');
const { computeOrder, isValidPriceLabel } = require('./pricing');
const CATALOG = require('./catalog.json');
const DEFAULT_REVIEWS = require('./default-reviews.json');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
// Browsers send the Origin without a trailing slash, so strip it from the configured values.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim().replace(/\/+$/, '')).filter(Boolean);
// Behind Render's proxy every request would otherwise share one IP and one rate-limit bucket.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));
else if (process.env.RENDER) app.set('trust proxy', 1);
app.use(cors(ALLOWED_ORIGINS.length ? { origin: ALLOWED_ORIGINS } : undefined));

const { MONGODB_URI, ADMIN_API_KEY, ADMIN_PASSWORD, JWT_SECRET, DISCORD_CLIENT_ID, DISCORD_WEBHOOK_URL } = process.env;
const PORT = process.env.PORT || 5000;
['MONGODB_URI', 'ADMIN_API_KEY', 'ADMIN_PASSWORD', 'JWT_SECRET', 'DISCORD_CLIENT_ID'].forEach(name => {
  if (!process.env[name]) {
    console.error('Missing ' + name + ' in your .env file. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
});

const PAYMENTS = ['D17', 'Binance', 'Discord Credit', 'Ooredoo'];
const ORDER_STATUSES = ['Pending', 'Paid', 'Completed', 'Cancelled'];
const MAX_NOTIFY_ATTEMPTS = 10;

mongoose.connect(MONGODB_URI).then(seedIfEmpty).catch(err => console.error('MongoDB error:', err.message));

/* ---------- models ---------- */
const Product = mongoose.model('Product', new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: String, category: String, subCategory: String, price: String, badge: String,
  inStock: Boolean, image: String, icon: String, desc: String, features: [String],
  variants: [{ title: String, price: String, originalPrice: String }]
}));

const User = mongoose.model('User', new mongoose.Schema({
  discordId: { type: String, unique: true, required: true },
  username: String, globalName: String, avatar: String,
  lastLogin: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: String, index: true, required: true },
  customerName: String, discordUsername: String, discordId: String, email: String, phone: String,
  items: [{ productId: String, title: String, variant: String, qty: Number, price: String, lineTotal: String }],
  total: String,
  payment: String,
  status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
  notified: { type: Boolean, default: false },
  notifyAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}));

const reviewSchema = new mongoose.Schema({
  userId: String, name: String, role: { type: String, default: 'Client' }, product: String,
  text: String, rating: Number, dateLabel: String, createdAt: { type: Date, default: Date.now }
});
// One review per customer per product (imported default reviews have no userId and are exempt).
reviewSchema.index({ userId: 1, product: 1 }, { unique: true, partialFilterExpression: { userId: { $type: 'string' } } });
const Review = mongoose.model('Review', reviewSchema);

const Meta = mongoose.model('Meta', new mongoose.Schema({ key: { type: String, unique: true }, value: String }));

async function seedIfEmpty() {
  if (!(await Product.countDocuments())) {
    await Product.insertMany(CATALOG);
    console.log('Catalog seeded (' + CATALOG.length + ' products).');
  }
  if (!(await Meta.findOne({ key: 'reviews-seeded' }))) {
    if (!(await Review.countDocuments())) {
      await Review.insertMany(DEFAULT_REVIEWS.map((r, i) => ({
        name: r.name, role: r.role, product: r.product, text: r.text, rating: r.rating,
        dateLabel: r.date, createdAt: new Date(Date.now() - i * 86400000)
      })));
    }
    await Meta.create({ key: 'reviews-seeded', value: '1' });
  }
}

/* ---------- helpers ---------- */
const wrap = fn => (req, res) => fn(req, res).catch(err => {
  console.error(req.method + ' ' + req.path + ' failed:', err.message);
  if (!res.headersSent) res.status(500).json({ error: 'Server error' });
});

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || !safeCompare(key, ADMIN_API_KEY)) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid x-api-key header' });
  }
  next();
}

function bearer(req) {
  const header = req.headers['authorization'] || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function requireAdminAuth(req, res, next) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized: missing admin session token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('not admin');
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid, please log in again' });
  }
}

async function requireUser(req, res, next) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: 'Please log in first' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'user' || !payload.sub) throw new Error('not user');
    const user = await User.findOne({ discordId: payload.sub });
    if (!user) return res.status(401).json({ error: 'Session invalid, please log in again' });
    if (user.isBlocked) return res.status(403).json({ error: 'This account is blocked' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid, please log in again' });
  }
}

async function discordGet(path, accessToken) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://discord.com/api' + path, {
      headers: { Authorization: 'Bearer ' + accessToken }, signal: controller.signal
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function orderForWebhook(o) {
  return {
    orderId: o.orderId, items: o.items, total: o.total, payment: o.payment,
    date: o.createdAt.toISOString(),
    customer: { name: o.customerName, discordUsername: o.discordUsername, discordId: o.discordId, email: o.email, phone: o.phone }
  };
}

async function notifyOrder(order) {
  if (!isValidWebhookUrl(DISCORD_WEBHOOK_URL)) return false;
  order.notifyAttempts += 1;
  try {
    await sendOrderNotification(orderForWebhook(order), DISCORD_WEBHOOK_URL);
    order.notified = true;
  } catch (err) {
    console.error('Order notification failed for ' + order.orderId + ':', err.message);
  }
  await order.save();
  return order.notified;
}

function publicOrder(o) {
  return {
    orderId: o.orderId, items: o.items, total: o.total, payment: o.payment, status: o.status,
    date: o.createdAt, notified: o.notified,
    customer: { name: o.customerName, discordUsername: o.discordUsername, discordId: o.discordId, email: o.email, phone: o.phone }
  };
}

/* ---------- auth ---------- */
const authLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 30 });

// The browser sends the Discord access token; we verify it with Discord ourselves.
app.post('/api/auth/discord', authLimiter, wrap(async (req, res) => {
  const accessToken = req.body && req.body.accessToken;
  if (typeof accessToken !== 'string' || accessToken.length < 10 || accessToken.length > 200) {
    return res.status(400).json({ error: 'accessToken is required' });
  }
  const [info, me] = await Promise.all([discordGet('/oauth2/@me', accessToken), discordGet('/users/@me', accessToken)]);
  if (!info || !me || !me.id) {
    console.warn('[auth] Discord rejected the token (expired, revoked or Discord unreachable)');
    return res.status(401).json({ error: 'Discord login could not be verified' });
  }
  if (!info.application || info.application.id !== DISCORD_CLIENT_ID) {
    console.warn('[auth] token belongs to app ' + (info.application && info.application.id) + ' but DISCORD_CLIENT_ID is ' + DISCORD_CLIENT_ID);
    return res.status(401).json({ error: 'Token was not issued for this site' });
  }
  const user = await User.findOneAndUpdate(
    { discordId: String(me.id) },
    { username: me.username, globalName: me.global_name || '', avatar: me.avatar || '', lastLogin: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (user.isBlocked) {
    console.warn('[auth] blocked user tried to log in: ' + user.discordId);
    return res.status(403).json({ error: 'This account is blocked' });
  }
  const token = jwt.sign({ role: 'user', sub: user.discordId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      discordId: user.discordId,
      username: user.username,
      name: user.globalName || user.username,
      email: me.email || '',
      avatar: user.avatar ? 'https://cdn.discordapp.com/avatars/' + user.discordId + '/' + user.avatar + '.png' : null
    }
  });
}));

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  if (now - entry.firstAttempt > LOGIN_WINDOW_MS) { entry.count = 0; entry.firstAttempt = now; }
  if (entry.count >= LOGIN_MAX_ATTEMPTS) return res.status(429).json({ error: 'Too many login attempts. Try again later.' });

  const { password } = req.body || {};
  const ok = typeof password === 'string' && safeCompare(password, ADMIN_PASSWORD);
  entry.count += 1;
  loginAttempts.set(ip, entry);
  if (!ok) return res.status(401).json({ error: 'Incorrect password' });

  loginAttempts.delete(ip);
  res.json({ token: jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' }), expiresIn: '12h' });
});

app.get('/api/admin/verify', requireAdminAuth, (req, res) => res.json({ ok: true }));
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const db = states[(mongoose.connection && mongoose.connection.readyState) || 0] || 'unknown';
  res.status(db === 'connected' ? 200 : 503).json({ ok: db === 'connected', db });
});

/* ---------- catalog ---------- */
app.get('/api/products', wrap(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(await Product.find({}, { _id: 0, __v: 0 }).lean());
}));

// Resets the catalog to server/catalog.json (this overwrites price/stock edits made in the dashboard).
app.post('/api/products/seed', requireApiKey, wrap(async (req, res) => {
  await Product.deleteMany({});
  const products = await Product.insertMany(Array.isArray(req.body) && req.body.length ? req.body : CATALOG);
  res.json({ message: 'Products Added Successfully!', count: products.length });
}));

app.patch('/api/admin/products/:id', requireAdminAuth, wrap(async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const body = req.body || {};

  if (body.price !== undefined) {
    if (!isValidPriceLabel(body.price)) return res.status(400).json({ error: 'Invalid price. Use formats like $15.00 or 16 TND' });
    product.price = body.price.trim();
  }
  if (body.inStock !== undefined) {
    if (typeof body.inStock !== 'boolean') return res.status(400).json({ error: 'inStock must be true or false' });
    product.inStock = body.inStock;
  }
  if (body.variants !== undefined) {
    if (!Array.isArray(body.variants)) return res.status(400).json({ error: 'variants must be an array' });
    for (const edit of body.variants) {
      const v = product.variants.find(x => x.title === (edit && edit.title));
      if (!v) return res.status(400).json({ error: 'Unknown variant: ' + clean(edit && edit.title, 60) });
      if (!isValidPriceLabel(edit.price)) return res.status(400).json({ error: 'Invalid price for variant ' + v.title });
      v.price = edit.price.trim();
      if (edit.originalPrice !== undefined) {
        if (edit.originalPrice && !isValidPriceLabel(edit.originalPrice)) return res.status(400).json({ error: 'Invalid original price for variant ' + v.title });
        v.originalPrice = edit.originalPrice ? edit.originalPrice.trim() : '';
      }
    }
  }
  await product.save();
  res.json(product.toObject({ versionKey: false, transform: (doc, ret) => { delete ret._id; return ret; } }));
}));

/* ---------- orders ---------- */
const orderLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 });

app.post('/api/orders', orderLimiter, requireUser, wrap(async (req, res) => {
  const body = req.body || {};
  if (!PAYMENTS.includes(body.payment)) return res.status(400).json({ error: 'Invalid payment method' });

  const catalog = await Product.find().lean();
  const computed = computeOrder(Array.isArray(body.items) ? body.items.map(i => ({ id: i && i.id, variant: i && i.variant, qty: i && i.qty })) : null, catalog);
  if (computed.error) return res.status(400).json({ error: computed.error });

  const c = body.customer && typeof body.customer === 'object' ? body.customer : {};
  const fields = {
    userId: req.user.discordId,
    customerName: req.user.globalName || req.user.username,
    discordUsername: clean(c.discordUsername, 100),
    discordId: clean(c.discordId, 40),
    email: clean(c.email, 120),
    phone: clean(c.phone, 40),
    items: computed.items,
    total: computed.total,
    payment: body.payment
  };

  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create(Object.assign({ orderId: '#ORD-' + crypto.randomInt(100000, 1000000) }, fields));
    } catch (err) {
      if (!(err && err.code === 11000)) throw err;
    }
  }
  if (!order) return res.status(500).json({ error: 'Could not generate an order id, please try again' });

  await notifyOrder(order);
  res.status(201).json({ ok: true, order: publicOrder(order) });
}));

app.get('/api/orders/mine', requireUser, wrap(async (req, res) => {
  const orders = await Order.find({ userId: req.user.discordId }).sort({ createdAt: -1 }).limit(100);
  res.json(orders.map(publicOrder));
}));

// Re-send Discord notifications that failed (every 2 minutes, up to 10 attempts per order).
setInterval(async () => {
  try {
    const pending = await Order.find({ notified: false, notifyAttempts: { $lt: MAX_NOTIFY_ATTEMPTS } }).limit(20);
    for (const order of pending) await notifyOrder(order);
  } catch (err) { /* DB not ready yet */ }
}, 2 * 60 * 1000).unref();

app.get('/api/admin/orders', requireAdminAuth, wrap(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
  res.json(orders.map(o => Object.assign(publicOrder(o), { notifyAttempts: o.notifyAttempts })));
}));

app.patch('/api/admin/orders/:orderId', requireAdminAuth, wrap(async (req, res) => {
  const status = req.body && req.body.status;
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = await Order.findOneAndUpdate({ orderId: req.params.orderId }, { status }, { new: true });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(publicOrder(order));
}));

app.post('/api/admin/orders/:orderId/resend', requireAdminAuth, wrap(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const ok = await notifyOrder(order);
  res.json({ ok, notified: order.notified });
}));

/* ---------- reviews ---------- */
app.get('/api/reviews', wrap(async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json(reviews.map(r => ({ id: String(r._id), name: r.name, role: r.role, product: r.product, text: r.text, rating: r.rating, date: r.createdAt })));
}));

app.post('/api/reviews', createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10 }), requireUser, wrap(async (req, res) => {
  const body = req.body || {};
  const product = clean(body.product, 100);
  const text = clean(body.text, 500);
  const rating = Number(body.rating);
  if (!product || text.length < 5 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please choose a product, a rating and write a short review' });
  }
  try {
    const review = await Review.create({
      userId: req.user.discordId, name: req.user.globalName || req.user.username, role: 'Client', product, text, rating
    });
    res.status(201).json({ ok: true, id: String(review._id) });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: 'You already reviewed this product' });
    throw err;
  }
}));

app.delete('/api/admin/reviews/:id', requireAdminAuth, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  await Review.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}));

/* ---------- users ---------- */
app.get('/api/admin/users', requireAdminAuth, wrap(async (req, res) => {
  res.json(await User.find().sort({ lastLogin: -1 }).limit(500));
}));

app.post('/api/admin/users/block', requireAdminAuth, wrap(async (req, res) => {
  const { discordId, isBlocked } = req.body || {};
  if (typeof discordId !== 'string' || typeof isBlocked !== 'boolean') return res.status(400).json({ error: 'discordId and isBlocked are required' });
  await User.findOneAndUpdate({ discordId }, { isBlocked });
  res.json({ success: true });
}));

console.log('[config] allowed origins: ' + (ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(', ') : 'ANY (ALLOWED_ORIGINS is empty)') +
  ' | discord client id ends with ...' + DISCORD_CLIENT_ID.slice(-4) +
  ' | webhook ' + (isValidWebhookUrl(DISCORD_WEBHOOK_URL) ? 'set' : 'NOT set') +
  ' | trust proxy ' + app.get('trust proxy'));

if (!isValidWebhookUrl(DISCORD_WEBHOOK_URL)) {
  console.warn('DISCORD_WEBHOOK_URL is missing or invalid: orders are saved but Discord notifications are skipped.');
}

app.listen(PORT, () => console.log('Server running on port ' + PORT));
