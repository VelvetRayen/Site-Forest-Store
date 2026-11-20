// Server-side price logic: the browser only sends product ids, variants and quantities.
const MAX_ITEMS = 25;
const MAX_QTY = 99;
const PRICE_PATTERN = /^(?:From\s+)?(?:\$\s?\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?\s?TND)$/i;

function parsePrice(label) {
  const text = String(label == null ? '' : label);
  const match = text.match(/\d+(?:[.,]\d+)?/);
  const amount = match ? parseFloat(match[0].replace(',', '.')) : 0;
  const currency = /TND/i.test(text) ? 'TND' : (text.indexOf('$') > -1 ? '$' : '');
  return { amount, currency };
}

function formatAmount(amount, currency) {
  const value = Math.round(amount * 100) / 100;
  if (currency === '$') return '$' + value.toFixed(2);
  const text = value % 1 === 0 ? String(value) : value.toFixed(2);
  return currency ? text + ' ' + currency : text;
}

function isValidPriceLabel(label) {
  return typeof label === 'string' && PRICE_PATTERN.test(label.trim()) && parsePrice(label).amount > 0;
}

// requested: [{ id, variant, qty }], catalog: array of products (plain objects)
function computeOrder(requested, catalog) {
  if (!Array.isArray(requested) || requested.length < 1 || requested.length > MAX_ITEMS) {
    return { error: 'items must contain between 1 and ' + MAX_ITEMS + ' entries' };
  }
  const byId = new Map(catalog.map(p => [p.id, p]));
  const items = [];
  const sums = {};
  for (const raw of requested) {
    if (!raw || typeof raw !== 'object') return { error: 'Invalid item' };
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { error: 'Invalid quantity' };
    const product = byId.get(String(raw.id));
    if (!product) return { error: 'Unknown product: ' + String(raw.id).slice(0, 40) };
    if (!product.inStock) return { error: product.title + ' is out of stock' };

    let label = product.price;
    let variantTitle = '';
    const variants = product.variants || [];
    if (variants.length) {
      const v = variants.find(x => x.title === raw.variant);
      if (!v) return { error: 'Please choose a valid option for ' + product.title };
      label = v.price;
      variantTitle = v.title;
    }
    const { amount, currency } = parsePrice(label);
    if (!(amount > 0)) return { error: 'Price unavailable for ' + product.title };

    items.push({
      productId: product.id,
      title: product.title,
      variant: variantTitle,
      qty,
      price: formatAmount(amount, currency),
      lineTotal: formatAmount(amount * qty, currency)
    });
    sums[currency] = Math.round(((sums[currency] || 0) + amount * qty) * 100) / 100;
  }
  const total = Object.keys(sums).map(c => formatAmount(sums[c], c)).join(' + ');
  return { items, total };
}

module.exports = { parsePrice, formatAmount, isValidPriceLabel, computeOrder, MAX_ITEMS, MAX_QTY };
