/**
 * SkoshX (https://skoshx.com)
 * Physics/Spring based animation functions
 */

import { Spring, PartialSpringConfig } from "wobble";

export interface SpringType {
  mass: number;
  stiffness: number;
  damping: number;
}

export const SpringTypes = {
  BOUNCY: {
    mass: 1,
    stiffness: 100,
    damping: 10,
  },
  DEFAULT: {
    mass: 3,
    stiffness: 1000,
    damping: 500,
  },
  SLOWED: {
    mass: 1,
    stiffness: 200,
    damping: 100,
  },
};

export interface AnimationDescription {
  from: number;
  to: number;
}

export type SetterFunction = (element: HTMLElement, spring: Spring) => void;

export function animation(
  description: AnimationDescription,
  element: HTMLElement,
  setter: SetterFunction,
  config?: PartialSpringConfig,
  type?: SpringType
): Promise<void> {
  return new Promise(async (resolve) => {
    const defaults = {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      fromValue: description.from,
      toValue: description.to,
    };
    config = { ...defaults, ...config, ...type };
    // Resolve if there is nothing to animate
    if (config.fromValue === config.toValue) resolve();

    const spring = new Spring(config);
    // Listeners
    spring
      .onStart(() => {})
      .onUpdate((s) => {
        setter(element, s);
      })
      .onStop(() => {
        resolve();
      })
      .start();
  });
}

export function expand(
  element: HTMLElement,
  config?: PartialSpringConfig,
  type?: SpringType
): Promise<void> {
  return new Promise(async (resolve) => {
    const height: number = element.scrollHeight;
    const heightAnimation: AnimationDescription = { from: 0, to: height };
    await animation(
      heightAnimation,
      element,
      PropertySetter("height", "px"),
      config,
      type
    );
    resolve();
  });
}

export function fadeOut(
  element: HTMLElement,
  config?: PartialSpringConfig,
  type?: SpringType
): Promise<void> {
  return new Promise(async (resolve) => {
    const fadeAnimation: AnimationDescription = { from: 1, to: 0 };
    await animation(fadeAnimation, element, OpacitySetter, config, type);
    resolve();
  });
}

export function fadeIn(
  element: HTMLElement,
  config?: PartialSpringConfig,
  type?: SpringType
): Promise<void> {
  return new Promise(async (resolve) => {
    const fadeAnimation: AnimationDescription = { from: 0, to: 1 };
    await animation(fadeAnimation, element, OpacitySetter, config, type);
    resolve();
  });
}

// Setters
export const PropertySetter = (property: any, unit: string = "") => {
  return (el: HTMLElement, spring: Spring) => {
    el.style[property] = `${spring.currentValue}${unit}`;
  };
};
export const OpacitySetter: SetterFunction = (
  element: HTMLElement,
  spring: Spring
) => {
  element.style.opacity = spring.currentValue.toString();
};
