/**
 * SkoshX (https://skoshx.com)
 * A class for locking/unlocking scroll
 */

export class ScrollLock {
  private static instance: ScrollLock;

  constructor() {
    // Bind scroll handler
    this.scrollHandler = this.scrollHandler.bind(this);
  }

  public static getInstance(): ScrollLock {
    if (!ScrollLock.instance) {
      ScrollLock.instance = new ScrollLock();
    }
    return ScrollLock.instance;
  }

  private scrollHandler(e: Event) {
    e.preventDefault();
  }

  public lock() {
    document.addEventListener("scroll", this.scrollHandler, { passive: false });
  }
  public unlock() {
    document.removeEventListener("scroll", this.scrollHandler);
  }
}
