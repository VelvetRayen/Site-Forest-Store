# Forest Store

Static storefront (HTML/CSS/JS) with an optional Express + MongoDB backend.

## Structure

```
*.html            Pages (index, store, terms, review, faq, tax, internet, login, profile)
css/              One stylesheet per page + cart.css (shopping cart)
js/               Page scripts, auth.js, cart.js, order-notify.js, config.js
assets/img/       logo.png, baner.png
assets/docs/      facture.pdf (invoice template)
server/           Express API (catalog, users, admin login, Discord order webhook)
```

## Frontend

Serve the folder with any static server. Set the API address in `js/config.js` (`apiBaseUrl`).

## Backend

1. `cd server && npm install`
2. Copy `.env.example` to `.env` and fill it in. `DISCORD_WEBHOOK_URL` is the Discord channel webhook that receives every completed order (the URL never reaches the browser).
3. `npm start` (API on port 5000), `npm test` (webhook tests).

Orders are sent to `POST /api/orders` (login required). The server prices every order from its own catalog, saves it in MongoDB, then notifies Discord; failed notifications are retried automatically every 2 minutes (and can be re-sent from the admin page).

Login: the browser sends the Discord token to `POST /api/auth/discord`; the server verifies it with Discord (`DISCORD_CLIENT_ID` must match your app) and returns a signed session token.

Admin dashboard: open `/admin.html` and log in with `ADMIN_PASSWORD`. You can edit product prices (and variant prices), switch products in/out of stock, change order statuses, re-send Discord notifications, delete reviews and block users. The catalog is seeded from `server/catalog.json` the first time the server starts on an empty database; `npm run seed` resets it to that file (this overwrites dashboard edits).
