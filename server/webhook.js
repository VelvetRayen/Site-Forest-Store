const WEBHOOK_PATTERN = /^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
const EMBED_COLOR = 0x00ff52;
const SEND_TIMEOUT_MS = 8000;
const MAX_ITEMS = 25;
const MAX_QTY = 99;

function isValidWebhookUrl(url) {
  return typeof url === 'string' && WEBHOOK_PATTERN.test(url);
}

function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function validateOrder(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body' };

  const orderId = clean(body.orderId, 24);
  if (!/^[A-Za-z0-9#-]{4,24}$/.test(orderId)) return { error: 'Invalid orderId' };

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > MAX_ITEMS) {
    return { error: 'items must contain between 1 and ' + MAX_ITEMS + ' entries' };
  }

  const items = [];
  for (const raw of body.items) {
    if (!raw || typeof raw !== 'object') return { error: 'Invalid item' };
    const title = clean(raw.title, 100);
    const qty = Number(raw.qty);
    if (!title || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { error: 'Invalid item' };
    items.push({
      title,
      variant: clean(raw.variant, 100),
      qty,
      price: clean(raw.price, 30),
      lineTotal: clean(raw.lineTotal, 30)
    });
  }

  const total = clean(body.total, 60);
  if (!total) return { error: 'Missing total' };

  const customer = body.customer && typeof body.customer === 'object' ? body.customer : {};

  return {
    order: {
      orderId,
      items,
      total,
      payment: clean(body.payment, 40),
      date: clean(body.date, 60),
      customer: {
        name: clean(customer.name, 100),
        discordUsername: clean(customer.discordUsername, 100),
        discordId: clean(customer.discordId, 40),
        email: clean(customer.email, 120),
        phone: clean(customer.phone, 40)
      }
    }
  };
}

function fit(text, max) {
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
}

function buildPayload(order, now) {
  const itemLines = order.items.map((i) => {
    const name = i.variant ? i.title + ' (' + i.variant + ')' : i.title;
    const amount = i.lineTotal || i.price;
    return '• ' + i.qty + '× ' + name + (amount ? ' — ' + amount : '');
  });

  let itemsText = '';
  for (let n = 0; n < itemLines.length; n++) {
    const next = itemsText ? itemsText + '\n' + itemLines[n] : itemLines[n];
    if (next.length > 1000) {
      itemsText += '\n… +' + (itemLines.length - n) + ' more';
      break;
    }
    itemsText = next;
  }

  const c = order.customer;
  const customerLines = [
    c.name && '**Account:** ' + c.name,
    c.discordUsername && '**Discord:** ' + c.discordUsername,
    c.discordId && '**Discord ID:** ' + c.discordId,
    c.email && '**Email:** ' + c.email,
    c.phone && '**Phone:** ' + c.phone
  ].filter(Boolean);

  const fields = [
    { name: '👤 Customer', value: fit(customerLines.join('\n') || '—', 1024), inline: false },
    { name: '🛒 Items', value: fit(itemsText, 1024), inline: false },
    { name: '💰 Total', value: fit(order.total, 1024), inline: true },
    { name: '💳 Payment', value: fit(order.payment || '—', 1024), inline: true },
    { name: '🕒 Placed at', value: fit(order.date || '—', 1024), inline: true }
  ];

  return {
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: '📦 New Order ' + (order.orderId.startsWith('#') ? order.orderId : '#' + order.orderId),
        color: EMBED_COLOR,
        fields,
        footer: { text: 'Forest Store • Order System' },
        timestamp: now().toISOString()
      }
    ]
  };
}

async function sendOrderNotification(order, webhookUrl, options) {
  const fetchImpl = (options && options.fetch) || fetch;
  const now = (options && options.now) || (() => new Date());
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(order, now)),
      signal: controller.signal
    });
    if (!res.ok) throw new Error('Discord responded with status ' + res.status);
  } finally {
    clearTimeout(timer);
  }
}

function createOrderHandler(options) {
  const webhookUrl = options && options.webhookUrl;
  return async function orderHandler(req, res) {
    if (!isValidWebhookUrl(webhookUrl)) {
      return res.status(503).json({ error: 'Order notifications are not configured' });
    }
    const result = validateOrder(req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    try {
      await sendOrderNotification(result.order, webhookUrl, options);
      return res.json({ ok: true });
    } catch (err) {
      console.error('Order notification failed:', err.message);
      return res.status(502).json({ error: 'Could not deliver the order notification' });
    }
  };
}

function createRateLimiter(options) {
  const windowMs = options.windowMs;
  const max = options.max;
  const hits = new Map();
  const sweep = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, entry] of hits) {
      if (entry.start < cutoff) hits.delete(key);
    }
  }, windowMs);
  if (sweep.unref) sweep.unref();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = req.ip;
    let entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }
    next();
  };
}

module.exports = {
  isValidWebhookUrl,
  validateOrder,
  buildPayload,
  sendOrderNotification,
  createOrderHandler,
  createRateLimiter
};
