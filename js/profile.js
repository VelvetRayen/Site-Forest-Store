const user = Auth.getUser();

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = id => document.getElementById(id);
let orders = [];

function icons() { if (window.lucide) lucide.createIcons(); }

function toast(msg) {
  const t = $('toast-notification'); $('toast-msg').textContent = msg;
  t.classList.add('show'); clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 3500);
}

function statusClass(st) {
  st = String(st).toLowerCase();
  if (/(complet|paid|deliver|success)/.test(st)) return 'ok';
  if (/(cancel|refus|fail|reject)/.test(st)) return 'bad';
  return 'warn';
}
function localInvoices() {
  try { return JSON.parse(localStorage.getItem('forest_invoices')) || {}; } catch (e) { return {}; }
}

async function loadOrders() {
  let res;
  try { res = await Auth.request('/api/orders/mine'); } catch (e) { return null; }
  if (!res.ok || !Array.isArray(res.data)) return null;
  const invoices = localInvoices();
  return res.data.map(o => ({
    id: o.orderId,
    title: o.items.map(i => `${i.qty > 1 ? i.qty + 'x ' : ''}${i.title}${i.variant ? ' (' + i.variant + ')' : ''}`).join(', '),
    price: o.total,
    status: o.status || 'Pending',
    date: o.date ? new Date(o.date).toLocaleString() : '',
    payment: o.payment || '-',
    email: (o.customer && o.customer.email) || user.email,
    items: o.items,
    pdf: (invoices[o.orderId] && invoices[o.orderId].pdf) || ''
  }));
}
function renderOrders() {
  const body = $('user-orders-body');
  $('user-orders-count').textContent = orders.length + (orders.length === 1 ? ' order' : ' orders');
  if (!orders.length) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">No orders yet. <a href="store.html">Visit the store</a></td></tr>';
    return;
  }
  body.innerHTML = orders.map((o, i) => `<tr>
    <td>${esc(o.id)}</td><td>${esc(o.title)}</td><td>${esc(o.price)}</td>
    <td><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span></td>
    <td><button type="button" class="btn-invoice" data-i="${i}"><i data-lucide="file-text" style="width:14px;height:14px;"></i> Invoice</button></td></tr>`).join('');
  icons();
}

const modal = $('invoice-modal');
function openInvoice(o) {
  $('invoice-body').innerHTML = `
    <div class="inv-head">
      <div class="inv-brand"><img src="assets/img/logo.png" alt="" onerror="this.style.display='none'">Forest Store</div>
      <div class="inv-meta"><h3>INVOICE</h3><span>${esc(o.id)}</span><span>${esc(o.date)}</span></div>
    </div>
    <div class="inv-grid">
      <div><small>BILLED TO</small><b>${esc(user.name)}</b><span>${esc(o.email)}</span><span>Discord ID: ${esc(user.discordId)}</span></div>
      <div><small>PAYMENT</small><b>${esc(o.payment)}</b><span><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span></span></div>
    </div>
    <table class="inv-table">
      <thead><tr><th>Item</th><th>Amount</th></tr></thead>
      <tbody>${o.items.map(i => `<tr><td>${esc((i.qty > 1 ? i.qty + 'x ' : '') + i.title + (i.variant ? ' (' + i.variant + ')' : ''))}</td><td>${esc(i.lineTotal)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td>Total</td><td>${esc(o.price)}</td></tr></tfoot>
    </table>
    <p class="inv-foot">Thank you for shopping at Forest Store &middot; ${esc(FOREST_CONFIG.discordInvite.replace(/^https?:\/\//, ''))}</p>`;
  const dl = $('inv-download');
  dl.classList.toggle('hidden', !o.pdf);
  if (o.pdf) { dl.href = o.pdf; dl.download = 'Invoice_' + String(o.id).replace(/[^\w-]/g, '') + '.pdf'; }
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeInvoice() {
  modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function submitTicket(e) {
  e.preventDefault();
  const subject = $('ticket-subject').value.trim(), message = $('ticket-message').value.trim();
  if (!subject || !message) return;
  const id = 'TCK-' + Date.now().toString().slice(-6);
  try {
    const list = JSON.parse(localStorage.getItem('forest_tickets') || '[]');
    list.push({ id, userId: user.discordId, subject, message, date: new Date().toLocaleString(), status: 'Open' });
    localStorage.setItem('forest_tickets', JSON.stringify(list));
  } catch (err) {  }
  toast(`Ticket ${id} submitted successfully! We will contact you soon.`);
  $('support-ticket-form').reset();
}

function init() {
  $('user-profile-name').textContent = user.name;
  $('user-email').textContent = user.email || '';
  $('user-discord-id').textContent = 'Discord ID: ' + (user.discordId || '-');
  const img = $('user-avatar-img');
  img.src = user.avatar || 'assets/img/logo.png';
  img.onerror = () => { img.onerror = null; img.src = 'assets/img/logo.png'; };
  document.title = user.name + ' - Forest Store';
  $('year').textContent = new Date().getFullYear();

  $('user-orders-body').innerHTML = '<tr class="empty-row"><td colspan="5">Loading your orders…</td></tr>';
  loadOrders().then(list => {
    if (list === null) {
      $('user-orders-body').innerHTML = '<tr class="empty-row"><td colspan="5">Could not load your orders. The server may be waking up, please refresh in a moment.</td></tr>';
      return;
    }
    orders = list; renderOrders();
  });
  $('user-orders-body').addEventListener('click', e => {
    const b = e.target.closest('.btn-invoice'); if (b) openInvoice(orders[+b.dataset.i]);
  });
  $('inv-close').addEventListener('click', closeInvoice);
  $('inv-print').addEventListener('click', () => window.print());
  modal.addEventListener('click', e => { if (e.target === modal) closeInvoice(); });

  const btn = $('menu-btn'), menu = $('mobile-menu');
  const setMenu = open => { menu.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', e => { e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', () => { if (innerWidth >= 992) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeInvoice(); setMenu(false); } });
  icons();
}

if (user) init();
