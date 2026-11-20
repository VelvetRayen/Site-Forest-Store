// Single source of truth for the site's contact details and API location.
window.FOREST_CONFIG = {
  apiBaseUrl: 'https://forest-store-api.onrender.com',
  discordInvite: 'https://discord.gg/akJzbRqeK',
  discordClientId: '1553131920823689226',
  phone: '+216 27966681',
  whatsappNumber: '+21625310421'
};

(function () {
  function apply() {
    var cfg = window.FOREST_CONFIG;
    document.querySelectorAll('a[href*="discord.gg/"]').forEach(function (a) {
      a.setAttribute('href', cfg.discordInvite);
    });
    document.querySelectorAll('[data-phone]').forEach(function (el) {
      el.textContent = cfg.phone;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
