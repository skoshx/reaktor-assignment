/**
 * A simple CORS proxy to access an API that doesn't
 * send CORS headers.
 */

import express from 'express';
import got from 'got';

const API_ENDPOINT_BASE = "https://bad-api-assignment.reaktor.com";
const getProductsEndpoint = (category: string) => `${API_ENDPOINT_BASE}/v2/products/${category}`;
const getAvailabilityEndpoint = (manufacturer: string) => `${API_ENDPOINT_BASE}/v2/availability/${manufacturer}`;

const app = express();
const port = process.env.PORT || 3001;

function parseJSON(json: string): any | null {
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

const getResponse = async (endpoint: string, errorMode = false) => {
  return await errorMode ? got(endpoint, { headers: { "x-force-error-mode": "all" } }) : got(endpoint);
}

app.get('/v2/availability/:manufacturer', async (req, res) => {
  const manufacturer = req.params.manufacturer;
  try {
    const response = await getResponse(getAvailabilityEndpoint(manufacturer), req.header('x-force-error-mode') === "all")
    const json = parseJSON(response.body);
    res.json(json);
  } catch (e: any) {
    res.json(null);
  }
});

app.get('/v2/products/:product', async (req, res) => {
  const product = req.params.product;
  try {
    const response = await getResponse(getProductsEndpoint(product), req.header('x-force-error-mode') === "all")
    const json = parseJSON(response.body);
    res.json(json);
  } catch (e: any) {
    res.json(null);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on *:${port}`);
});