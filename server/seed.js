// Resets the catalog in the database to server/catalog.json (overwrites dashboard price/stock edits).
require('dotenv').config();
const axios = require('axios');
const PRODUCTS = require('./catalog.json');

const PORT = process.env.PORT || 5000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('Missing ADMIN_API_KEY in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

axios.post(`http://localhost:${PORT}/api/products/seed`, PRODUCTS, { headers: { 'x-api-key': ADMIN_API_KEY } })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response ? err.response.data : err.message));
