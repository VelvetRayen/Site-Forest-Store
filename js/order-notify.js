window.OrderNotifier = (function () {
  'use strict';

  var TIMEOUT_MS = 8000;

  function endpoint() {
    var base = (window.FOREST_CONFIG && window.FOREST_CONFIG.apiBaseUrl) || '';
    return base.replace(/\/+$/, '') + '/api/orders';
  }

  function payload(order) {
    return {
      orderId: order.orderId,
      date: order.date,
      payment: order.payment,
      total: order.total,
      items: order.items.map(function (i) {
        return { title: i.title, variant: i.variant, qty: i.qty, price: i.price, lineTotal: i.lineTotal };
      }),
      customer: {
        name: order.customer.name,
        discordUsername: order.customer.discordUsername,
        discordId: order.customer.discordId,
        email: order.customer.email,
        phone: order.customer.phone
      }
    };
  }

  function send(order) {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;
    return fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(order)),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      return res.ok;
    }).catch(function () {
      return false;
    }).then(function (ok) {
      if (timer) clearTimeout(timer);
      return ok;
    });
  }

  return { send: send };
})();
