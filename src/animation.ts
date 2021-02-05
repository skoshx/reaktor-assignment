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
  EXTRA_SLOWED: {
    mass: 1,
    stiffness: 100,
    damping: 100,
  },
  SUPER_SLOWED: {
    mass: 1,
    stiffness: 10,
    damping: 100,
  },
};

export interface AnimationDescription {
  from: number;
  to: number;
}

export type SetterFunction = (element: HTMLElement, spring: Spring) => void;
export type PureSpringCallback = (spring: Spring) => void;

export function pureSpring(
  description: AnimationDescription,
  callback: PureSpringCallback,
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
    const spring = new Spring(config);
    // Listeners
    spring
      .onStart(() => {})
      .onUpdate((s) => {
        callback(s);
      })
      .onStop(() => {
        resolve();
      })
      .start();
  });
}

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
    if (config.fromValue === config.toValue) resolve(); // Resolve if there is nothing to animate

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

export function springScrollTo(
  element: HTMLElement,
  target: HTMLElement,
  config?: PartialSpringConfig,
  type?: SpringType
): Promise<void> {
  return new Promise(async (resolve) => {
    const desc: AnimationDescription = {
      from: element.scrollTop,
      to: target.getBoundingClientRect().top + element.scrollTop,
    };
    await animation(desc, element, ScrollSetter, config, type);
    resolve();
  });
}

export function scrollTop(
  element: HTMLElement,
  config?: PartialSpringConfig
): Promise<void> {
  return new Promise(async (resolve) => {
    const desc: AnimationDescription = {
      from: element.scrollTop,
      to: 0,
    };
    await animation(desc, element, ScrollSetter, config, SpringTypes.DEFAULT);
    resolve();
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

export function collapse(
  element: HTMLElement,
  config?: PartialSpringConfig,
  type?: SpringType
): Promise<void> {
  return new Promise(async (resolve) => {
    // Set overflow hidden
    element.style.overflow = "hidden";

    const height: number = element.getBoundingClientRect().height;
    const paddingTop: number = parseInt(getComputedStyle(element).paddingTop);
    const paddingBottom: number = parseInt(
      getComputedStyle(element).paddingBottom
    );
    const heightAnimation: AnimationDescription = { from: height, to: 0 };
    const topAnimation: AnimationDescription = { from: paddingTop, to: 0 };
    const bottomAnimation: AnimationDescription = {
      from: paddingBottom,
      to: 0,
    };
    await Promise.all([
      animation(
        heightAnimation,
        element,
        PropertySetter("height", "px"),
        config,
        type
      ),
      animation(
        topAnimation,
        element,
        PropertySetter("paddingTop", "px"),
        config,
        type
      ),
      animation(
        bottomAnimation,
        element,
        PropertySetter("paddingBottom", "px"),
        config,
        type
      ),
    ]);
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
export const ScrollSetter: SetterFunction = (
  element: HTMLElement,
  spring: Spring
) => {
  element.scrollTop = spring.currentValue;
};
