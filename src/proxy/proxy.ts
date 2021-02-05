/**
 * A simple CORS proxy to access an API that doesn't
 * send CORS headers.
 */

import express from 'express';
import { request } from 'http';
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
  next();
});

app.get('/v2/availability/:manufacturer', async (req, res) => {
  const manufacturer = req.params.manufacturer;
  try {
    const response = await got(getAvailabilityEndpoint(manufacturer));
    const json = parseJSON(response.body);
    res.json(json);
  } catch (e: any) {
    res.json(null);
  }
});

app.get('/v2/products/:product', async (req, res) => {
  const product = req.params.product;
  try {
    const response = await got(getProductsEndpoint(product));
    const json = parseJSON(response.body);
    res.json(json);
  } catch (e: any) {
    res.json(null);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on *:${port}`);
});