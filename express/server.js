/**
 * SkoshX (https://skoshx.com)
 * Express server to host reaktor-assignment on Heroku, and a simple CORS proxy
 * to access an API that doesn't send CORS headers + some caching.
 */

const express = require("express");
const NodeCache = require("node-cache");
const _ = require("lodash");
const parser = require("fast-xml-parser");
const path = require("path");
const got = require("got");
const port = process.env.PORT ?? 3000;
const app = express();
const releasePath = path.join(__dirname, "..", "dist", "web");

const APICache = new NodeCache(); // In memory API cache

const MANUFACTURERS = [];

const API_ENDPOINT_BASE = "https://bad-api-assignment.reaktor.com";
const getProductsEndpoint = (category) =>
  `${API_ENDPOINT_BASE}/v2/products/${category}`;
const getAvailabilityEndpoint = (manufacturer) =>
  `${API_ENDPOINT_BASE}/v2/availability/${manufacturer}`;

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
  return (await errorMode)
    ? got(endpoint, { headers: { "x-force-error-mode": "all" } })
    : got(endpoint);
};

const updateAvailability = async (products, category) => {
  for (let i = 0; i < products.length; i++) {
    if (MANUFACTURERS.indexOf(products[i].manufacturer) === -1) {
      MANUFACTURERS.push(products[i].manufacturer); // Add new manufacturer
    }
  }

  // Fetch availability for all manufacturers.
  const requests = MANUFACTURERS.map((manufacturer) => {
    return getResponse(getAvailabilityEndpoint(manufacturer));
  });
  const resolved = await Promise.all(requests);
  for (let i = 0; i < resolved.length; i++) {
    const availability = parseJSON(resolved[i].body);
    // On error case, tries to update availability cache again.
    if (availability.response === "[]") {
      updateAvailability(products, category);
      return;
    }

    // Parse XML
    for (let j = 0; j < availability.response.length; j++) {
      const xml = parser.parse(availability.response[j].DATAPAYLOAD);
      availability.response[j].id = availability.response[j].id.toLowerCase();
      availability.response[j].availability = xml["AVAILABILITY"][
        "INSTOCKVALUE"
      ].toLowerCase();
      delete availability.response[j].DATAPAYLOAD;
    }

    // Merge products with availability
    const merged = _.map(products, (item) => {
      return _.extend(item, _.find(availability.response, { id: item.id }));
    });

    // Update Cache
    APICache.set(`/v2/products/${category}`, merged);
  }
};

// Initialize cache, retrieves the products their availability
// from the API, and caches them.
const initializeCache = async () => {
  const categories = ["gloves", "facemasks", "beanies"];
  for (let i = 0; i < categories.length; i++) {
    const response = await getResponse(getProductsEndpoint(categories[i]));
    const products = parseJSON(response.body);
    // Update availability cache
    updateAvailability(products, categories[i]);
  }
};

app.get("/v2/products/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const response = await getResponse(
      getProductsEndpoint(category),
      req.header("x-force-error-mode") === "all"
    );
    const products = parseJSON(response.body);
    // Update availability cache
    updateAvailability(products, category);

    // Check if cache available
    const cached = APICache.get(`/v2/products/${category}`);
    if (cached) {
      res.json(cached);
    } else {
      res.json(products);
    }
  } catch (e) {
    res.json(null);
  }
});

// If it's not an API request, serve site
app.get("*", (req, res) => {
  res.sendFile(path.join(releasePath, "index.html"));
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
  // Initialize cache
  initializeCache();
});
