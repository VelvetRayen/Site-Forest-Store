(function () {
  'use strict';

  var STORAGE_KEY = 'forest_cart_v1';
  var MAX_QTY = 99;
  var FALLBACK_IMAGE = 'assets/img/logo.png';

  var STRINGS = {
    en: {
      title: 'Your Cart', empty: 'Your cart is empty', browse: 'Browse the store', total: 'Total',
      checkout: 'Checkout', clear: 'Clear cart', remove: 'Remove', open: 'Open cart', close: 'Close cart',
      inc: 'Increase quantity', dec: 'Decrease quantity', one: 'item', many: 'items'
    },
    ar: {
      title: 'سلة التسوق', empty: 'سلتك فارغة', browse: 'تصفح المتجر', total: 'الإجمالي',
      checkout: 'إتمام الطلب', clear: 'تفريغ السلة', remove: 'إزالة', open: 'فتح السلة', close: 'إغلاق السلة',
      inc: 'زيادة الكمية', dec: 'تقليل الكمية', one: 'منتج', many: 'منتجات'
    }
  };

  var ICONS = {
    cart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
  };

  var items = load();
  var listeners = [];
  var els = null;
  var lastFocus = null;

  function t(key) {
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    return (STRINGS[lang] || STRINGS.en)[key];
  }

  function parsePrice(label) {
    var text = String(label == null ? '' : label);
    var match = text.match(/\d+(?:[.,]\d+)?/);
    var amount = match ? parseFloat(match[0].replace(',', '.')) : 0;
    var currency = /TND/i.test(text) ? 'TND' : (text.indexOf('$') > -1 ? '$' : '');
    return { amount: amount, currency: currency };
  }

  function formatAmount(amount, currency) {
    var value = Math.round(amount * 100) / 100;
    if (currency === '$') return '$' + value.toFixed(2);
    var text = value % 1 === 0 ? String(value) : value.toFixed(2);
    return currency ? text + ' ' + currency : text;
  }

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(data)) return [];
      return data.filter(function (i) {
        return i && typeof i.key === 'string' && typeof i.title === 'string' &&
          isFinite(i.amount) && i.amount >= 0 && Number.isInteger(i.qty) && i.qty >= 1 && i.qty <= MAX_QTY;
      });
    } catch (e) {
      return [];
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  function commit() {
    save();
    render();
    listeners.forEach(function (fn) { fn(getItems()); });
  }

  function getItems() {
    return items.map(function (i) { return Object.assign({}, i); });
  }

  function count() {
    return items.reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  function totals(list) {
    var out = {};
    (list || items).forEach(function (i) {
      out[i.currency] = (out[i.currency] || 0) + i.amount * i.qty;
    });
    Object.keys(out).forEach(function (c) { out[c] = Math.round(out[c] * 100) / 100; });
    return out;
  }

  function totalLabel(list) {
    var sums = totals(list);
    var keys = Object.keys(sums);
    if (!keys.length) return formatAmount(0, '$');
    return keys.map(function (c) { return formatAmount(sums[c], c); }).join(' + ');
  }

  function add(product, variant) {
    if (!product || !product.id) return;
    var label = variant ? variant.price : product.price;
    var parsed = parsePrice(label);
    var key = product.id + '|' + (variant ? variant.title : '');
    var found = items.filter(function (i) { return i.key === key; })[0];
    if (found) {
      found.qty = Math.min(MAX_QTY, found.qty + 1);
    } else {
      items.push({
        key: key,
        id: product.id,
        title: product.title,
        variant: variant ? variant.title : '',
        price: formatAmount(parsed.amount, parsed.currency),
        amount: parsed.amount,
        currency: parsed.currency,
        image: product.image || '',
        qty: 1
      });
    }
    commit();
    bump();
  }

  // Re-price the cart from the live catalog; drops items that no longer exist or are out of stock.
  // Returns true when anything changed.
  function sync(products) {
    if (!Array.isArray(products) || !products.length) return false;
    var changed = false;
    items = items.filter(function (item) {
      var product = products.filter(function (p) { return p.id === item.id; })[0];
      if (!product || !product.inStock) { changed = true; return false; }
      var variant = null;
      if (product.variants && product.variants.length) {
        variant = product.variants.filter(function (v) { return v.title === item.variant; })[0];
        if (!variant) { changed = true; return false; }
      }
      var parsed = parsePrice(variant ? variant.price : product.price);
      if (parsed.amount !== item.amount || parsed.currency !== item.currency) {
        item.amount = parsed.amount;
        item.currency = parsed.currency;
        item.price = formatAmount(parsed.amount, parsed.currency);
        changed = true;
      }
      return true;
    });
    if (changed) commit();
    return changed;
  }

  function setQty(key, qty) {
    var item = items.filter(function (i) { return i.key === key; })[0];
    if (!item) return;
    if (qty < 1) return remove(key);
    item.qty = Math.min(MAX_QTY, qty);
    commit();
  }

  function remove(key) {
    items = items.filter(function (i) { return i.key !== key; });
    commit();
  }

  function clear() {
    items = [];
    commit();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function iconButton(className, label, icon, onClick) {
    var btn = el('button', className);
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = icon;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function buildItem(item) {
    var row = el('li', 'cart-item');

    var img = el('img', 'cart-item-img');
    img.alt = '';
    img.src = item.image || FALLBACK_IMAGE;
    img.addEventListener('error', function () {
      img.onerror = null;
      img.src = FALLBACK_IMAGE;
    });

    var info = el('div', 'cart-item-info');
    info.appendChild(el('span', 'cart-item-title', item.title));
    if (item.variant) info.appendChild(el('span', 'cart-item-variant', item.variant));
    info.appendChild(el('span', 'cart-item-price', formatAmount(item.amount * item.qty, item.currency)));

    var qty = el('div', 'cart-qty');
    qty.appendChild(iconButton('cart-qty-btn', t('dec'), ICONS.minus, function () { setQty(item.key, item.qty - 1); }));
    qty.appendChild(el('span', 'cart-qty-value', String(item.qty)));
    var inc = iconButton('cart-qty-btn', t('inc'), ICONS.plus, function () { setQty(item.key, item.qty + 1); });
    if (item.qty >= MAX_QTY) inc.disabled = true;
    qty.appendChild(inc);

    var side = el('div', 'cart-item-side');
    side.appendChild(iconButton('cart-remove-btn', t('remove'), ICONS.trash, function () { remove(item.key); }));
    side.appendChild(qty);

    row.appendChild(img);
    row.appendChild(info);
    row.appendChild(side);
    return row;
  }

  function render() {
    if (!els) return;
    var n = count();

    els.badges.forEach(function (badge) {
      badge.textContent = n > 99 ? '99+' : String(n);
      badge.hidden = n === 0;
    });
    els.navButtons.forEach(function (btn) { btn.setAttribute('aria-label', t('open')); });

    els.title.textContent = t('title');
    els.count.textContent = n + ' ' + (n === 1 ? t('one') : t('many'));
    els.close.setAttribute('aria-label', t('close'));

    els.body.innerHTML = '';
    if (!items.length) {
      var empty = el('div', 'cart-empty');
      empty.appendChild(el('p', null, t('empty')));
      var link = el('a', 'cart-btn cart-btn-ghost', t('browse'));
      link.href = 'store.html';
      empty.appendChild(link);
      els.body.appendChild(empty);
    } else {
      var list = el('ul', 'cart-list');
      items.forEach(function (item) { list.appendChild(buildItem(item)); });
      els.body.appendChild(list);
    }

    els.footer.hidden = !items.length;
    els.totalLabel.textContent = t('total');
    els.totalValue.textContent = totalLabel();
    els.clear.textContent = t('clear');
    els.checkout.textContent = t('checkout');
  }

  function bump() {
    if (!els) return;
    els.navButtons.forEach(function (btn) {
      btn.classList.remove('cart-bump');
      void btn.offsetWidth;
      btn.classList.add('cart-bump');
    });
  }

  function isOpen() {
    return !!els && els.drawer.classList.contains('is-open');
  }

  function open() {
    if (!els || isOpen()) return;
    lastFocus = document.activeElement;
    render();
    els.overlay.classList.add('is-open');
    els.drawer.classList.add('is-open');
    els.drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('cart-open');
    els.close.focus();
  }

  function close() {
    if (!isOpen()) return;
    els.overlay.classList.remove('is-open');
    els.drawer.classList.remove('is-open');
    els.drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('cart-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function checkout() {
    if (!items.length) return;
    close();
    if (typeof api.onCheckout === 'function') api.onCheckout();
    else location.href = 'store.html?checkout=1';
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = els.drawer.querySelectorAll('button:not([disabled]), a[href]');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function createNavButton() {
    var btn = el('button', 'cart-nav-btn');
    btn.type = 'button';
    btn.innerHTML = ICONS.cart;
    var badge = el('span', 'cart-badge');
    badge.hidden = true;
    btn.appendChild(badge);
    btn.addEventListener('click', open);
    return btn;
  }

  function mountNav() {
    var header = document.getElementById('navbar');
    var buttons = [];
    if (header) {
      var desktop = header.querySelector('.nav-container > div.desktop-only');
      if (desktop) {
        var d = createNavButton();
        desktop.insertBefore(d, desktop.firstChild);
        buttons.push(d);
      }
      var mobile = header.querySelector('.nav-container > div.mobile-only');
      if (mobile) {
        var m = createNavButton();
        mobile.insertBefore(m, mobile.querySelector('#menu-btn'));
        buttons.push(m);
      }
    }
    if (!buttons.length) {
      var floating = createNavButton();
      floating.classList.add('cart-nav-floating');
      document.body.appendChild(floating);
      buttons.push(floating);
    }
    return buttons;
  }

  function mountDrawer() {
    var overlay = el('div', 'cart-overlay');
    overlay.addEventListener('click', close);

    var drawer = el('aside', 'cart-drawer');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'cart-title');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.tabIndex = -1;
    drawer.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    var head = el('div', 'cart-head');
    var heading = el('div', 'cart-heading');
    var title = el('h2', 'cart-title');
    title.id = 'cart-title';
    var counter = el('span', 'cart-count');
    heading.appendChild(title);
    heading.appendChild(counter);
    var closeBtn = iconButton('cart-close', '', ICONS.close, close);
    head.appendChild(heading);
    head.appendChild(closeBtn);

    var body = el('div', 'cart-body');

    var footer = el('div', 'cart-footer');
    var totalRow = el('div', 'cart-total');
    var totalLabelEl = el('span', 'cart-total-label');
    var totalValueEl = el('strong', 'cart-total-value');
    totalRow.appendChild(totalLabelEl);
    totalRow.appendChild(totalValueEl);
    var actions = el('div', 'cart-actions');
    var clearBtn = el('button', 'cart-btn cart-btn-ghost');
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', clear);
    var checkoutBtn = el('button', 'cart-btn cart-btn-primary');
    checkoutBtn.type = 'button';
    checkoutBtn.addEventListener('click', checkout);
    actions.appendChild(clearBtn);
    actions.appendChild(checkoutBtn);
    footer.appendChild(totalRow);
    footer.appendChild(actions);

    drawer.appendChild(head);
    drawer.appendChild(body);
    drawer.appendChild(footer);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    return {
      overlay: overlay, drawer: drawer, title: title, count: counter, close: closeBtn,
      body: body, footer: footer, totalLabel: totalLabelEl, totalValue: totalValueEl,
      clear: clearBtn, checkout: checkoutBtn
    };
  }

  function init() {
    els = mountDrawer();
    els.navButtons = mountNav();
    els.badges = els.navButtons.map(function (b) { return b.querySelector('.cart-badge'); });
    render();
  }

  var api = {
    add: add,
    remove: remove,
    setQty: setQty,
    sync: sync,
    clear: clear,
    getItems: getItems,
    count: count,
    totals: totals,
    totalLabel: totalLabel,
    parsePrice: parsePrice,
    formatAmount: formatAmount,
    subscribe: function (fn) { listeners.push(fn); },
    open: open,
    close: close,
    checkout: checkout,
    onCheckout: null
  };

  window.Cart = api;

  window.addEventListener('storage', function (e) {
    if (e.key !== STORAGE_KEY) return;
    items = load();
    render();
    listeners.forEach(function (fn) { fn(getItems()); });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
