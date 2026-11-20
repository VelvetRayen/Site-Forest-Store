(function () {
  'use strict';

  var KEY = 'forest_user';
  var TOKEN_KEY = 'forest_token';
  var LEGACY_KEYS = ['currentUser', 'discord_user', 'logged_in_user'];
  var NEXT_KEY = 'forest_return_to';
  var DEFAULT_AVATAR = 'assets/img/logo.png';
  var IS_LOGIN_PAGE = /login\.html$/i.test(location.pathname);
  var USER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  function normalize(u) {
    if (!u || typeof u !== 'object') return null;
    var id = u.discordId || u.id || '';
    var avatar = u.avatar || u.avatarUrl || u.profilePic || null;
    if (avatar && !/^https?:\/\//i.test(avatar) && id) {
      avatar = 'https://cdn.discordapp.com/avatars/' + id + '/' + avatar + '.png';
    }
    var name = u.name || u.global_name || u.globalName || u.username;
    if (!name) return null;
    return { name: String(name), username: u.username ? String(u.username) : String(name),
             email: u.email || '', discordId: id, avatar: avatar };
  }

  function getToken() {
    try {
      var token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      var payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 < Date.now()) { clearSession(); return null; }
      return token;
    } catch (e) { return null; }
  }

  function clearSession() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(KEY, JSON.stringify(normalize(user)));
  }

  function apiBase() {
    return ((window.FOREST_CONFIG && window.FOREST_CONFIG.apiBaseUrl) || '').replace(/\/+$/, '');
  }

  // Authenticated API call. Resolves { ok, status, data }; rejects only on network failure.
  function request(path, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch(apiBase() + path, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401 && token) { clearSession(); }
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }

  function getUser() {
    if (!getToken()) return null;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
      for (var i = 0; i < LEGACY_KEYS.length; i++) {
        var old = localStorage.getItem(LEGACY_KEYS[i]);
        if (!old) continue;
        var u;
        try { u = normalize(JSON.parse(old)); } catch (e) { u = normalize({ name: old }); }
        if (u) { localStorage.setItem(KEY, JSON.stringify(u)); return u; }
      }
    } catch (e) {  }
    return null;
  }

  function logout() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TOKEN_KEY);
    LEGACY_KEYS.forEach(function (k) { localStorage.removeItem(k); });
    location.reload();
  }

  function safeNext(p) {
    if (typeof p !== 'string') return null;
    p = p.replace(/^\.?\//, '');
    if (!/^[A-Za-z0-9_\-]+\.html(\?[^#\s]*)?(#[^\s]*)?$/.test(p)) return null;
    return /^login\.html/i.test(p) ? null : p;
  }
  function currentPage() { return (location.pathname.split('/').pop() || 'index.html') + location.search; }
  function loginUrl() { return 'login.html?next=' + encodeURIComponent(currentPage()); }
  function rememberNext() {
    var target = safeNext(new URLSearchParams(location.search).get('next'));
    if (!target) {
      try { var ref = new URL(document.referrer);
            if (ref.origin === location.origin) target = safeNext(ref.pathname.split('/').pop() + ref.search); } catch (e) {}
    }
    if (target) sessionStorage.setItem(NEXT_KEY, target); else sessionStorage.removeItem(NEXT_KEY);
  }
  function consumeNext() {
    var n = safeNext(sessionStorage.getItem(NEXT_KEY)) || 'index.html';
    sessionStorage.removeItem(NEXT_KEY);
    return n;
  }

  var current = getUser();
  document.documentElement.classList.add(current ? 'auth-in' : 'auth-out');

  var style = document.createElement('style');
  style.id = 'forest-auth-style';
  style.textContent =
    'html.auth-out a[href^="profile.html"]{display:none!important}' +
    'html.auth-in #auth-container>a,html.auth-in #auth-container-mobile>a,' +
    'html.auth-in #discord-auth-container>a,html.auth-in #discord-auth-container-mobile>a{display:none!important}' +
    '.user-profile-container{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid rgba(0,255,82,.3);padding:4px 12px 4px 6px;border-radius:12px;box-shadow:0 0 15px rgba(0,255,82,.15)}' +
    '.user-avatar{width:32px;height:32px;border-radius:50%;border:2px solid var(--green-a,#00ff52);object-fit:cover}' +
    '.user-name{font-size:14px;font-weight:700;color:#fff;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.btn-logout{background:rgba(255,59,48,.2);border:1px solid rgba(255,59,48,.4);color:#ff453a;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s ease}' +
    '.btn-logout:hover{background:rgba(255,59,48,.4);color:#fff}';
  document.head.appendChild(style);

  function isClosed(el) {
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.nextElementSibling) return true;
      el = el.parentElement;
    }
    return false;
  }

  function addProfileLink(box, itemSel, build, final) {
    if (!box || box.querySelector('a[href^="profile.html"]') || !(final || isClosed(box))) return;
    var items = box.querySelectorAll(itemSel), last = items[items.length - 1];
    if (!last) return;
    var a = build(last);
    last.parentNode.insertBefore(a, last.nextSibling);
  }

  function injectProfileLinks(final) {
    var active = /profile\.html$/i.test(location.pathname);
    function navLink(model) {
      var a = model.cloneNode(false);
      ['id', 'data-i18n', 'data-key', 'data-en', 'data-ar'].forEach(function (n) { a.removeAttribute(n); });
      a.classList.remove('active'); if (active) a.classList.add('active');
      a.setAttribute('href', 'profile.html');
      a.setAttribute('data-en', 'Profile'); a.setAttribute('data-ar', 'الملف الشخصي');
      a.textContent = 'Profile';
      return a;
    }
    addProfileLink(document.querySelector('nav.nav-links-wrapper'), 'a.nav-link', navLink, final);
    addProfileLink(document.getElementById('mobile-menu'), 'a.nav-link', navLink, final);
    addProfileLink(document.getElementById('quick-menu'), 'a.quick-access-item', function (model) {
      var a = model.cloneNode(false);
      a.setAttribute('href', 'profile.html');
      a.innerHTML = USER_ICON + ' <span>Profile</span>';
      return a;
    }, final);
  }

  function buildProfile(user) {
    var wrap = document.createElement('div'); wrap.className = 'user-profile-container';
    var img = document.createElement('img'); img.className = 'user-avatar'; img.alt = user.name;
    img.src = user.avatar || DEFAULT_AVATAR;
    img.onerror = function () { img.onerror = null; img.src = DEFAULT_AVATAR; };
    var span = document.createElement('span'); span.className = 'user-name'; span.textContent = user.name;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn-logout';
    btn.textContent = 'Logout'; btn.addEventListener('click', logout);
    wrap.appendChild(img); wrap.appendChild(span); wrap.appendChild(btn);
    return wrap;
  }

  function buildLoginButton(kind) {
    var a = document.createElement('a'); a.href = loginUrl(); a.className = 'btn-primary';
    a.style.cssText = kind === 'mobile'
      ? 'width:100%;justify-content:center;height:46px;border-radius:12px;display:flex;align-items:center;gap:8px'
      : 'display:flex;align-items:center;gap:8px';
    a.innerHTML = '<span>Login</span><i data-lucide="log-in" style="width:16px;height:16px;"></i>';
    return a;
  }

  var SLOT_IDS = { desktop: ['discord-auth-container', 'auth-container'],
                   mobile:  ['discord-auth-container-mobile', 'auth-container-mobile'] };

  function renderSlots(user, final) {
    ['desktop', 'mobile'].forEach(function (kind) {
      var slot = document.getElementById(SLOT_IDS[kind][0]) || document.getElementById(SLOT_IDS[kind][1]);
      if (!slot) {
        var host = kind === 'mobile' ? document.getElementById('mobile-menu') : document.querySelector('header div.desktop-only');
        if (!host || !(final || isClosed(host))) return;
        slot = document.createElement('div'); slot.id = SLOT_IDS[kind][0]; slot.setAttribute('data-auth-slot', kind);
        if (kind === 'mobile') slot.style.marginTop = '16px';
        host.appendChild(slot);
        if (!user) slot.appendChild(buildLoginButton(kind));
      }
      if (user && (final || isClosed(slot)) && !slot.querySelector('.user-profile-container')) {
        slot.innerHTML = ''; slot.appendChild(buildProfile(user));
      }
    });
  }

  function apply(final) {
    if (IS_LOGIN_PAGE) return;
    if (current) injectProfileLinks(final);
    renderSlots(current, final);
    if (final) {
      var links = document.querySelectorAll('a[href="login.html"]');
      for (var i = 0; i < links.length; i++) links[i].setAttribute('href', loginUrl());
      if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    }
  }

  var observer = null;
  if (!IS_LOGIN_PAGE) {
    observer = new MutationObserver(function () { apply(false); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  function ready() { if (observer) observer.disconnect(); apply(true); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  window.Auth = {
    getUser: getUser, getToken: getToken, setSession: setSession, request: request,
    isLoggedIn: function () { return !!getUser(); },
    logout: logout, loginUrl: loginUrl, rememberNext: rememberNext, consumeNext: consumeNext,
    render: function () { apply(true); }
  };

  window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === TOKEN_KEY) location.reload(); });
})();
