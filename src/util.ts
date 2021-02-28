/**
 * SkoshX (https://skoshx.com)
 * Utility functions
 */

import { getProductsEndpoint } from "./config";
import { EventEmitter } from "./event";
import ky from "ky";
import { Logger, LogLevels } from "./logger";
import { ProgressEvents } from "./components/progress";

export interface IndexableTemplateObject<T> {
  [key: string]: T;
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// API requests

export interface Product {
  id: string;
  type: string;
  name: string;
  color: string[];
  price: number;
  manufacturer: string;
  availability?: TAvailability;
}

export async function getProducts(
  category: string,
  errorMode?: boolean
): Promise<Product[]> {
  const endpoint = getProductsEndpoint(category);
  const api = getApi(errorMode);
  try {
    EventEmitter.emit(ProgressEvents.Progress, 0.3);
    const response = (await api.get(endpoint).json()) as Product[];
    EventEmitter.emit(ProgressEvents.Finished);
    return response;
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

export type TAvailability = "instock" | "outofstock" | "lessthan10";

export function getApi(errorMode?: boolean) {
  if (errorMode) {
    return ky.extend({
      timeout: false,
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.set("x-force-error-mode", "all");
          },
        ],
      },
    });
  } else {
    return ky.extend({ timeout: false });
  }
}
