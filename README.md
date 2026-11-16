# Forest Store

Storefront for a Discord community selling digital goods (Discord services, gaming items, streaming subscriptions, apps, mobile data plans). Static HTML/CSS/JS site plus a small Express + MongoDB API.

Payment is manual: checkout generates a PDF invoice in the browser and sends the order to a Discord channel via webhook. The team follows up with the customer on Discord.

## Features

- Catalog of 34 products with search, categories, variants and pagination
- Cart saved in `localStorage` (TND and USD)
- Checkout with D17, Ooredoo, Binance or Discord Credit, plus a PDF invoice (`pdf-lib`)
- Order notification to Discord through the API (checkout still works if the API is down)
- Login with Discord (OAuth2, client-side), profile page with order history
- Reviews, FAQ, fee calculator, mobile data plans page
- English / Arabic toggle (RTL supported)

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript, pdf-lib, Lucide icons
- **Backend:** Node.js 18+, Express, Mongoose, jsonwebtoken, dotenv

## Structure

```
*.html      Pages (index, store, review, faq, internet, tax, terms, login, profile)
css/        One stylesheet per page
js/         One script per page, plus auth.js, cart.js, config.js
assets/     Images and the invoice template (facture.pdf)
server/     API, Discord webhook, seed script, tests
```

## Setup

**Frontend:** no build step. Serve the folder with any static server.

```bash
python3 -m http.server 8080
```

Set the API address in `js/config.js` (`apiBaseUrl`). For your own copy, also replace `DISCORD_CLIENT_ID` in `js/login.js` and register your login URL as an OAuth2 redirect in the Discord developer portal.

**Backend (optional):**

```bash
cd server
npm install
cp .env.example .env   # fill in the values
npm start              # http://localhost:5000
npm test               # webhook tests
```

Required in `.env`: `MONGODB_URI`, `ADMIN_PASSWORD`, `ADMIN_API_KEY`, `JWT_SECRET`. Set `DISCORD_WEBHOOK_URL` to receive orders and `ALLOWED_ORIGINS` for CORS.

## Notes

- The catalog lives in `js/store.js` and is duplicated in `server/seed.js`. Update both.
- Orders, reviews, cart and session are stored in the browser's `localStorage`.

## License

MIT. See [LICENSE](LICENSE).
