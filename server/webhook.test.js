const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { isValidWebhookUrl, validateOrder, buildPayload, createOrderHandler, createRateLimiter } = require('./webhook');

const VALID_URL = 'https://discord.com/api/webhooks/123456789012345678/abc_DEF-123';

function sampleBody(overrides) {
  return Object.assign({
    orderId: '#ORD-482913',
    date: '11/1/2026, 7:15:00 PM',
    payment: 'D17',
    total: '$20.00 + 55 TND',
    items: [
      { title: 'Full Server Setup & Design', variant: '', qty: 1, price: '$20.00', lineTotal: '$20.00' },
      { title: 'Netflix', variant: '6 Mois Privé', qty: 1, price: '55 TND', lineTotal: '55 TND' }
    ],
    customer: { name: 'Rayen', discordUsername: 'rayen', discordId: '123456789012345678', email: 'a@b.co', phone: '27966681' }
  }, overrides);
}

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; }
  };
}

test('webhook URL validation', () => {
  assert.equal(isValidWebhookUrl(VALID_URL), true);
  assert.equal(isValidWebhookUrl('https://evil.example/api/webhooks/1/x'), false);
  assert.equal(isValidWebhookUrl('http://discord.com/api/webhooks/1/x'), false);
  assert.equal(isValidWebhookUrl(undefined), false);
});

test('validateOrder accepts a well-formed order and trims fields', () => {
  const { order, error } = validateOrder(sampleBody({ payment: '  D17  ' }));
  assert.equal(error, undefined);
  assert.equal(order.payment, 'D17');
  assert.equal(order.items.length, 2);
});

test('validateOrder rejects malformed orders', () => {
  assert.ok(validateOrder(null).error);
  assert.ok(validateOrder(sampleBody({ orderId: 'x' })).error);
  assert.ok(validateOrder(sampleBody({ items: [] })).error);
  assert.ok(validateOrder(sampleBody({ items: [{ title: 'A', qty: 0 }] })).error);
  assert.ok(validateOrder(sampleBody({ items: [{ title: 'A', qty: 1.5 }] })).error);
  assert.ok(validateOrder(sampleBody({ total: '' })).error);
});

test('buildPayload formats the embed and disables mentions', () => {
  const { order } = validateOrder(sampleBody({ customer: { name: '@everyone' } }));
  const payload = buildPayload(order, () => new Date('2026-11-01T18:00:00Z'));
  const embed = payload.embeds[0];
  assert.deepEqual(payload.allowed_mentions, { parse: [] });
  assert.equal(embed.title, '📦 New Order #ORD-482913');
  assert.equal(embed.timestamp, '2026-11-01T18:00:00.000Z');
  const byName = Object.fromEntries(embed.fields.map((f) => [f.name, f.value]));
  assert.match(byName['🛒 Items'], /• 1× Full Server Setup & Design — \$20\.00/);
  assert.match(byName['🛒 Items'], /• 1× Netflix \(6 Mois Privé\) — 55 TND/);
  assert.equal(byName['💰 Total'], '$20.00 + 55 TND');
  embed.fields.forEach((f) => assert.ok(f.value.length <= 1024));
});

test('handler posts the embed to the webhook', async () => {
  const received = [];
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      received.push({ method: req.method, type: req.headers['content-type'], body: JSON.parse(raw) });
      res.writeHead(204);
      res.end();
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const realFetch = fetch;
  const handler = createOrderHandler({
    webhookUrl: VALID_URL,
    fetch: (url, init) => realFetch('http://127.0.0.1:' + port + '/hook', init)
  });
  const res = fakeRes();
  await handler({ body: sampleBody() }, res);
  server.close();
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(received.length, 1);
  assert.equal(received[0].method, 'POST');
  assert.equal(received[0].type, 'application/json');
  assert.equal(received[0].body.embeds[0].title, '📦 New Order #ORD-482913');
});

test('handler maps failures to proper status codes', async () => {
  const unconfigured = fakeRes();
  await createOrderHandler({ webhookUrl: undefined })({ body: sampleBody() }, unconfigured);
  assert.equal(unconfigured.statusCode, 503);

  const invalid = fakeRes();
  await createOrderHandler({ webhookUrl: VALID_URL })({ body: { orderId: 'x' } }, invalid);
  assert.equal(invalid.statusCode, 400);

  const failing = fakeRes();
  const originalError = console.error;
  console.error = () => {};
  await createOrderHandler({
    webhookUrl: VALID_URL,
    fetch: async () => ({ ok: false, status: 404 })
  })({ body: sampleBody() }, failing);
  console.error = originalError;
  assert.equal(failing.statusCode, 502);
});

test('rate limiter blocks after the limit', () => {
  const limiter = createRateLimiter({ windowMs: 60000, max: 2 });
  const results = [];
  for (let n = 0; n < 3; n++) {
    const res = fakeRes();
    let passed = false;
    limiter({ ip: '1.2.3.4' }, res, () => { passed = true; });
    results.push(passed ? 'ok' : res.statusCode);
  }
  assert.deepEqual(results, ['ok', 'ok', 429]);
});
