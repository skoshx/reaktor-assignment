/**
 * SkoshX (https://skoshx.com)
 * Header component
 */

import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { EventEmitter } from "../event";
import {
  getProducts,
  IndexableTemplateObject,
  Product,
  TAvailability,
} from "../util";
import { TABS } from "../index";
import { fadeIn, fadeOut } from "../animation";

export interface ProductProps {
  path: string;
  tab: number;
  product?: string;
}

export const ProductComponent = (props: ProductProps) => {
  const product = TABS[props.tab];
  const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  EventEmitter.on("AddProducts", () => {
    // Add products
    const newVisible = [
      ...visibleProducts,
      ...loadedProducts.slice(0, Math.min(100, loadedProducts.length)),
    ];
    const newLoaded = loadedProducts.slice(
      Math.min(100, loadedProducts.length),
      loadedProducts.length
    );
    setVisibleProducts(newVisible);
    setLoadedProducts(newLoaded);
  });
  useEffect(() => {
    (async () => {
      // Async IIFE since async useEffect is not yet implemented.
      await fadeOut(document.querySelector(".product-container"));
      let productsResult = await getProducts(product);
      // Visible products [0-100]
      // Loaded products [100-]
      setVisibleProducts(
        productsResult.slice(0, Math.min(100, productsResult.length))
      );
      setLoadedProducts(
        productsResult.slice(
          Math.min(100, productsResult.length),
          productsResult.length
        )
      );
      await fadeIn(document.querySelector(".product-container"));
    })();
  }, [product]);
  const productElements = visibleProducts.map(
    (product: Product, index: number) => {
      const colors = product.color.map((color) => {
        const colorObject: IndexableTemplateObject<string> = {
          blue: "#3498db",
          white: "#ecf0f1",
          green: "#2ecc71",
          yellow: "#f1c40f",
          grey: "#7f8c8d",
          red: "#e74c3c",
          black: "#222",
          purple: "#9b59b6",
        };
        return (
          <div
            className="color-circle"
            style={{ backgroundColor: colorObject[color] }}
          ></div>
        );
      });
      const availabilityToString = (availability?: TAvailability) => {
        const availabilityStrings = {
          instock: "In stock",
          lessthan10: "Less than 10 in stock",
          outofstock: "Out of stock",
        };
        return availability
          ? availabilityStrings[availability]
          : "Availability not found";
      };
      return (
        <div className="product">
          <h2 class="name">{product.name}</h2>
          <h6 class="h-small">
            {product.manufacturer} |{" "}
            {availabilityToString(product.availability)}
          </h6>
          <h2 class="price">{product.price}€</h2>
          <div
            className="color-container"
            style="display: flex; margin-bottom: 1.5rem;"
          >
            {colors}
          </div>
        </div>
      );
    }
  );
  return (
    <div className="product-container u-spacing-30">{productElements}</div>
  );
};
