(function () {
  'use strict';

  var TOKEN_KEY = 'forest_admin_token';
  var STATUSES = ['Pending', 'Paid', 'Completed', 'Cancelled'];
  var state = { tab: 'products', data: { products: [], orders: [], reviews: [], users: [] } };

  var $ = function (id) { return document.getElementById(id); };
  var content = $('content');

  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }

  var toastTimer;
  function toast(message, isError) {
    var el = $('toast');
    el.textContent = message;
    el.className = 'show' + (isError ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = ''; }, 3500);
  }

  function base() { return ((window.FOREST_CONFIG && window.FOREST_CONFIG.apiBaseUrl) || '').replace(/\/+$/, ''); }
  function token() { return sessionStorage.getItem(TOKEN_KEY); }

  function api(path, method, body) {
    return fetch(base() + path, {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) { showLogin('Session expired, please log in again.'); throw new Error('unauthorized'); }
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
      });
    });
  }

  function fail(err) { if (err.message !== 'unauthorized') toast(err.message || 'Network error', true); }

  /* ---------- login ---------- */
  function showLogin(message) {
    sessionStorage.removeItem(TOKEN_KEY);
    $('app-view').hidden = true;
    $('login-view').hidden = false;
    $('login-error').textContent = message || '';
  }

  function showApp() {
    $('login-view').hidden = true;
    $('app-view').hidden = false;
    load(state.tab);
  }

  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    $('login-error').textContent = '';
    fetch(base() + '/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: $('login-password').value })
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    }).then(function (r) {
      if (!r.ok) { $('login-error').textContent = r.data.error || 'Login failed'; return; }
      sessionStorage.setItem(TOKEN_KEY, r.data.token);
      $('login-password').value = '';
      showApp();
    }).catch(function () { $('login-error').textContent = 'Server unreachable. It may be waking up, try again.'; });
  });

  $('logout').addEventListener('click', function () { showLogin(''); });
  $('refresh').addEventListener('click', function () { load(state.tab); });
  $('search').addEventListener('input', function () { render(); });
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]');
    if (!b) return;
    state.tab = b.getAttribute('data-tab');
    $('search').value = '';
    Array.prototype.forEach.call($('tabs').children, function (x) { x.classList.toggle('active', x === b); });
    load(state.tab);
  });

  /* ---------- loading ---------- */
  var ENDPOINTS = { products: '/api/products', orders: '/api/admin/orders', reviews: '/api/reviews', users: '/api/admin/users' };

  function load(tab) {
    content.replaceChildren(h('p', { class: 'empty', text: 'Loading…' }));
    api(ENDPOINTS[tab]).then(function (data) { state.data[tab] = data; render(); }).catch(function (err) {
      content.replaceChildren(h('p', { class: 'empty', text: 'Could not load data. The server may be waking up, try Refresh.' }));
      fail(err);
    });
  }

  function matches(values) {
    var q = $('search').value.trim().toLowerCase();
    return !q || values.join(' ').toLowerCase().indexOf(q) > -1;
  }

  function table(headers, rows) {
    if (!rows.length) return h('p', { class: 'empty', text: 'Nothing to show.' });
    return h('div', { class: 'table-wrap' }, [h('table', {}, [
      h('thead', {}, [h('tr', {}, headers.map(function (t) { return h('th', { text: t }); }))]),
      h('tbody', {}, rows)
    ])]);
  }

  function render() {
    var view = { products: renderProducts, orders: renderOrders, reviews: renderReviews, users: renderUsers }[state.tab];
    content.replaceChildren(view());
  }

  /* ---------- products: price + stock ---------- */
  function renderProducts() {
    var rows = state.data.products
      .filter(function (p) { return matches([p.title, p.category, p.subCategory || '']); })
      .map(productRow);
    return table(['Product', 'Price', 'Status', ''], rows);
  }

  function productRow(p) {
    var priceInput = h('input', { class: 'price', value: p.price, 'aria-label': 'Price of ' + p.title });
    var variantInputs = (p.variants || []).map(function (v) {
      var input = h('input', { class: 'price', value: v.price, 'aria-label': 'Price of ' + v.title });
      return { title: v.title, input: input, node: h('div', { class: 'variant' }, [h('span', { class: 'name', text: v.title }), input]) };
    });

    var stockBtn = h('button', { class: 'btn', type: 'button' });
    function paintStock() {
      stockBtn.textContent = p.inStock ? 'In stock' : 'Out of stock';
      stockBtn.className = 'btn ' + (p.inStock ? '' : 'danger');
    }
    paintStock();

    stockBtn.addEventListener('click', function () {
      stockBtn.disabled = true;
      api('/api/admin/products/' + encodeURIComponent(p.id), 'PATCH', { inStock: !p.inStock })
        .then(function (updated) { p.inStock = updated.inStock; paintStock(); toast(p.title + ': ' + (p.inStock ? 'in stock' : 'out of stock')); })
        .catch(fail)
        .then(function () { stockBtn.disabled = false; });
    });

    var saveBtn = h('button', { class: 'btn primary', type: 'button', text: 'Save price' });
    saveBtn.addEventListener('click', function () {
      saveBtn.disabled = true;
      var body = { price: priceInput.value.trim() };
      if (variantInputs.length) body.variants = variantInputs.map(function (v) { return { title: v.title, price: v.input.value.trim() }; });
      api('/api/admin/products/' + encodeURIComponent(p.id), 'PATCH', body)
        .then(function (updated) { Object.assign(p, updated); toast('Saved: ' + p.title); })
        .catch(fail)
        .then(function () { saveBtn.disabled = false; });
    });

    return h('tr', {}, [
      h('td', {}, [h('strong', { text: p.title }), h('div', { class: 'muted', text: p.category + (p.subCategory ? ' / ' + p.subCategory : '') })]),
      h('td', {}, [priceInput].concat(variantInputs.map(function (v) { return v.node; }))),
      h('td', {}, [stockBtn]),
      h('td', {}, [saveBtn])
    ]);
  }

  /* ---------- orders ---------- */
  function badgeClass(status) { return status === 'Completed' || status === 'Paid' ? 'ok' : status === 'Cancelled' ? 'bad' : 'warn'; }

  function renderOrders() {
    var rows = state.data.orders.filter(function (o) {
      return matches([o.orderId, o.customer.name || '', o.customer.discordUsername || '', o.customer.phone || '', o.status]);
    }).map(function (o) {
      var select = h('select', { 'aria-label': 'Status of ' + o.orderId }, STATUSES.map(function (s) {
        return h('option', { value: s, text: s });
      }));
      select.value = o.status;
      select.addEventListener('change', function () {
        api('/api/admin/orders/' + encodeURIComponent(o.orderId), 'PATCH', { status: select.value })
          .then(function (u) { o.status = u.status; toast(o.orderId + ' → ' + u.status); })
          .catch(function (err) { select.value = o.status; fail(err); });
      });

      var notify = h('span', { class: 'badge ' + (o.notified ? 'ok' : 'bad'), text: o.notified ? 'Discord ✓' : 'Not sent (' + (o.notifyAttempts || 0) + ')' });
      var resend = h('button', { class: 'btn', type: 'button', text: 'Resend' });
      resend.addEventListener('click', function () {
        resend.disabled = true;
        api('/api/admin/orders/' + encodeURIComponent(o.orderId) + '/resend', 'POST')
          .then(function (r) { o.notified = r.notified; toast(r.ok ? 'Notification sent' : 'Discord still unreachable', !r.ok); render(); })
          .catch(fail)
          .then(function () { resend.disabled = false; });
      });

      var c = o.customer || {};
      return h('tr', {}, [
        h('td', {}, [h('strong', { text: o.orderId }), h('div', { class: 'muted', text: new Date(o.date).toLocaleString() })]),
        h('td', {}, [h('div', { text: c.name || '-' }), h('div', { class: 'muted', text: [c.discordUsername, c.phone].filter(Boolean).join(' · ') })]),
        h('td', {}, o.items.map(function (i) { return h('div', { text: (i.qty > 1 ? i.qty + 'x ' : '') + i.title + (i.variant ? ' (' + i.variant + ')' : '') }); })),
        h('td', {}, [h('strong', { text: o.total }), h('div', { class: 'muted', text: o.payment })]),
        h('td', {}, [select]),
        h('td', {}, o.notified ? [notify] : [notify, ' ', resend])
      ]);
    });
    return table(['Order', 'Customer', 'Items', 'Total', 'Status', 'Discord'], rows);
  }

  /* ---------- reviews ---------- */
  function renderReviews() {
    var rows = state.data.reviews.filter(function (r) { return matches([r.name, r.product, r.text]); }).map(function (r) {
      var del = h('button', { class: 'btn danger', type: 'button', text: 'Delete' });
      del.addEventListener('click', function () {
        if (!confirm('Delete the review by ' + r.name + '?')) return;
        api('/api/admin/reviews/' + encodeURIComponent(r.id), 'DELETE')
          .then(function () { state.data.reviews = state.data.reviews.filter(function (x) { return x.id !== r.id; }); render(); toast('Review deleted'); })
          .catch(fail);
      });
      return h('tr', {}, [
        h('td', { text: r.name }), h('td', { text: r.product }),
        h('td', { text: '★'.repeat(r.rating) }), h('td', { text: r.text }), h('td', {}, [del])
      ]);
    });
    return table(['Customer', 'Product', 'Rating', 'Review', ''], rows);
  }

  /* ---------- users ---------- */
  function renderUsers() {
    var rows = state.data.users.filter(function (u) { return matches([u.username || '', u.globalName || '', u.discordId]); }).map(function (u) {
      var btn = h('button', { class: 'btn' + (u.isBlocked ? '' : ' danger'), type: 'button', text: u.isBlocked ? 'Unblock' : 'Block' });
      btn.addEventListener('click', function () {
        api('/api/admin/users/block', 'POST', { discordId: u.discordId, isBlocked: !u.isBlocked })
          .then(function () { u.isBlocked = !u.isBlocked; render(); toast((u.username || u.discordId) + (u.isBlocked ? ' blocked' : ' unblocked')); })
          .catch(fail);
      });
      return h('tr', {}, [
        h('td', { text: u.globalName || u.username || '-' }), h('td', { text: u.discordId }),
        h('td', { text: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-' }),
        h('td', {}, [h('span', { class: 'badge ' + (u.isBlocked ? 'bad' : 'ok'), text: u.isBlocked ? 'Blocked' : 'Active' })]),
        h('td', {}, [btn])
      ]);
    });
    return table(['User', 'Discord ID', 'Last login', 'Status', ''], rows);
  }

  /* ---------- boot ---------- */
  if (token()) {
    api('/api/admin/verify').then(showApp).catch(function () {});
  }
})();
