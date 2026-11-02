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

Orders are sent by the browser to `POST /api/orders`; if the API is unreachable the order flow still completes.
