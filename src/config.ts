/**
 * SkoshX (https://skoshx.com)
 * API Config
 */

export const DEBUG = process.env.NODE_ENV !== "production";
export const API_ENDPOINT_BASE = `${location.protocol}//${location.hostname}`;

export const getProductsEndpoint = (category: string) => `${API_ENDPOINT_BASE}/v2/products/${category}`;
export const getAvailabilityEndpoint = (manufacturer: string) => `${API_ENDPOINT_BASE}/v2/availability/${manufacturer}`;
