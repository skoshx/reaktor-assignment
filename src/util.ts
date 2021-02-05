/**
 * SkoshX (https://skoshx.com)
 * Utility functions
 */

import { getAvailabilityEndpoint, getProductsEndpoint } from "./config";
import { EventEmitter } from "./event";
import ky from 'ky';
import { Logger, LogLevels } from "./logger";
import { report } from "process";
import { availabilityResponse, productResponse } from "./mock";
import { markAsUntransferable } from "worker_threads";
import { ProgressEvents } from "./components/progress";
import { TimeoutError } from "got/dist/source/core/utils/timed-out";

/**
 * Returns the saved value of a cookie, or null if not set
 * @param {string} name Name of the cookie
 */
export function getCookie(name: string) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function setCookie(name: string, value: string, days: number) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export const isTouchDevice = () => {
  return "ontouchstart" in window;
};

export interface IndexableTemplateObject<T> {
  [key: string]: T;
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// API requests

export function parseJSON(json: string): any | null {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export interface Product {
  id: string;
  type: string;
  name: string;
  color: string[];
  price: number;
  manufacturer: string;
}

export async function getProducts(category: string, errorMode?: boolean): Promise<Product[]> {
  const endpoint = getProductsEndpoint(category);
  const api = getApi(errorMode);
  try {
    EventEmitter.emit(ProgressEvents.Progress, 0.3);
    const response = await api.get(endpoint).json() as Product[];
    EventEmitter.emit(ProgressEvents.Finished);
    return response;
    // return await api.get(endpoint).json() as Product[];
  } catch (e: any) {
    Logger.log(e, LogLevels.Error);
    EventEmitter.emit(ProgressEvents.Finished);
  }
  return [];
}

export interface Availability {
  id: string;
  DATAPAYLOAD: string;
}
export interface AvailabilityResponse {
  code: number;
  response: Availability[];
}

export type TAvailability = "instock" | "outofstock" | "lessthan10" | "notfound";
export async function getAvailabilityById(manufacturer: string, id: string, errorMode?: boolean): Promise<TAvailability> {
  const endpoint = getAvailabilityEndpoint(manufacturer);
  const api = getApi(errorMode);
  try {
    EventEmitter.emit(ProgressEvents.Progress, 0.3);
    console.log("emitting");
    const response: AvailabilityResponse = await api.get(endpoint).json();
    EventEmitter.emit(ProgressEvents.Finished);
    const results = response.response;
    console.log(id);
    for (let i = 0; i < results.length; i++) {
      if (results[i].id.toLowerCase() == id) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(results[i].DATAPAYLOAD, "text/xml");
        const availability = xml.getElementsByTagName("INSTOCKVALUE")[0].textContent.toLowerCase() as TAvailability;
        return availability;
      }
    }
  } catch (e) {
    Logger.log(e, LogLevels.Error);
    EventEmitter.emit(ProgressEvents.Finished);
  }
  return "notfound";
}

export function getApi(errorMode?: boolean) {
  if (errorMode) {
    return ky.extend({
      timeout: false,
      hooks: {
        beforeRequest: [
          request => {
            request.headers.set('x-force-error-mode', 'all');
          }
        ]
      }
    });
  } else {
    return ky.extend({ timeout: false });
  }
}
