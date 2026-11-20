const test = require('node:test');
const assert = require('node:assert');
const { computeOrder, isValidPriceLabel, parsePrice } = require('./pricing');

const catalog = [
  { id: 'a', title: 'Bot', price: '$15.00', inStock: true },
  { id: 'b', title: 'Nitro', price: 'From $3.00', inStock: true, variants: [{ title: '1 Month', price: '$3.00' }, { title: '1 Year', price: '$25.00' }] },
  { id: 'c', title: 'Gone', price: '$5.00', inStock: false },
  { id: 'd', title: 'Tnd', price: '16 TND', inStock: true }
];

test('server computes totals from catalog, ignoring client prices', () => {
  const r = computeOrder([{ id: 'a', qty: 2, price: '$0.01' }, { id: 'b', variant: '1 Year', qty: 1 }], catalog);
  assert.equal(r.total, '$55.00');
  assert.equal(r.items[0].lineTotal, '$30.00');
  assert.equal(r.items[1].variant, '1 Year');
});

test('mixed currencies are summed separately', () => {
  assert.equal(computeOrder([{ id: 'a', qty: 1 }, { id: 'd', qty: 2 }], catalog).total, '$15.00 + 32 TND');
});

test('rejects unknown, out-of-stock, bad variant and bad quantity', () => {
  assert.ok(computeOrder([{ id: 'zzz', qty: 1 }], catalog).error);
  assert.match(computeOrder([{ id: 'c', qty: 1 }], catalog).error, /out of stock/);
  assert.ok(computeOrder([{ id: 'b', qty: 1 }], catalog).error);
  assert.ok(computeOrder([{ id: 'b', variant: 'nope', qty: 1 }], catalog).error);
  assert.ok(computeOrder([{ id: 'a', qty: 0 }], catalog).error);
  assert.ok(computeOrder([{ id: 'a', qty: 1.5 }], catalog).error);
  assert.ok(computeOrder([], catalog).error);
});

test('price label validation', () => {
  assert.ok(isValidPriceLabel('$15.00'));
  assert.ok(isValidPriceLabel('16 TND'));
  assert.ok(isValidPriceLabel('From $3.00'));
  assert.ok(!isValidPriceLabel('free'));
  assert.ok(!isValidPriceLabel('$0'));
  assert.ok(!isValidPriceLabel('<b>5</b> TND'));
  assert.equal(parsePrice('39 TND').currency, 'TND');
});
