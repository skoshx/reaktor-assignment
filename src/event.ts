/**
 * SkoshX (https://skoshx.com)
 * A basic event emitter
 */

import { IndexableTemplateObject } from "./util";

interface EventEmitterType {
  events: IndexableTemplateObject<any>;
  on: (name: string, listener: Function) => void;
  removeListener: (name: string, listenerToRemove: Function) => void;
  emit: (name: string, ...args: any[]) => void;
}


export const EventEmitter: EventEmitterType = {
  events: {},
  on: (name: string, listener: Function) => {
    if (!EventEmitter.events[name]) {
      EventEmitter.events[name] = [];
    }
    EventEmitter.events[name].push(listener);
  },
  removeListener: (name: string, listenerToRemove: Function) => {
    if (!EventEmitter.events[name]) {
      throw Error(`Can't remove event listener. Event ${name} doesn't exist.`);
    }
    const filterListeners = (listener: any) => listener !== listenerToRemove;
    EventEmitter.events[name] = EventEmitter.events[name].filter(
      filterListeners
    );
  },
  emit: (name: string, ...args: any[]) => {
    const fireCallbacks = (callback: any) => {
      callback(...args);
    };
    EventEmitter.events[name]?.forEach(fireCallbacks);
  },
};
