/**
 * SkoshX (https://skoshx.com)
 * Express server to host reaktor-assignment on Heroku, and a simple CORS proxy
 * to access an API that doesn't send CORS headers.
 */

const express = require('express');
const path = require('path');
const got = require('got');
const port = process.env.PORT ?? 3000;
const app = express();
const releasePath = path.join(__dirname, '..', 'dist', 'web');

const API_ENDPOINT_BASE = "https://bad-api-assignment.reaktor.com";
const getProductsEndpoint = (category) => `${API_ENDPOINT_BASE}/v2/products/${category}`;
const getAvailabilityEndpoint = (manufacturer) => `${API_ENDPOINT_BASE}/v2/availability/${manufacturer}`;

function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// CORS
app.use((req, res, next) => {
  res.header("access-control-allow-origin", process.env.ORIGIN || "*");
  res.header("access-control-allow-headers", "*");
  next();
});

app.use(express.static(releasePath));

const getResponse = async (endpoint, errorMode = false) => {
  return await errorMode ? got(endpoint, { headers: { "x-force-error-mode": "all" } }) : got(endpoint);
}

app.get('/v2/availability/:manufacturer', async (req, res) => {
  const manufacturer = req.params.manufacturer;
  try {
    const response = await getResponse(getAvailabilityEndpoint(manufacturer), req.header('x-force-error-mode') === "all")
    const json = parseJSON(response.body);
    res.json(json);
  } catch (e) {
    res.json(null);
  }
});

app.get('/v2/products/:product', async (req, res) => {
  const product = req.params.product;
  try {
    const response = await getResponse(getProductsEndpoint(product), req.header('x-force-error-mode') === "all")
    const json = parseJSON(response.body);
    res.json(json);
  } catch (e) {
    res.json(null);
  }
});

// If it's not an API request, server site
app.get('*', (req, res) => {
  res.sendFile(path.join(releasePath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});




