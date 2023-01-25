import { debounce, throttle } from './utils';
import config from './configure';
const { OverlayScrollbars } = await import('overlayscrollbars');
import { scrollTo } from 'seamless-scroll-polyfill';
// 滚动事件拦截器
class AbstractScrollManager {
  constructor() {
    if (this.constructor === AbstractScrollManager) {
      throw new TypeError('AbstractScrollManager is an abstract class and cannot be instantiated directly.');
    }
    this.store = {};
    this.handleScrollEvent = this.handleScrollEvent.bind(this);
  }
  register(name, fn) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    this.store[name] = fn;
  }
  unregister(name) {
    if (!name) throw new TypeError('name is required');
    delete this.store[name];
    // Reflect.deleteProperty(this.store, name);
  }
  handleScrollEvent(event) {
    for (let name in this.store) {
      this.store[name].call(this, event);
      // Reflect.apply(this.store[handler], this, args);
    }
  }
  getScrollTop() {
    throw new Error('not implemented');
  }
  getScrollLeft() {
    throw new Error('not implemented');
  }
  scrollTo(xCoord, yCoord) {
    throw new Error('not implemented');
  }
  triggerEvent() {
    throw new Error('not implemented');
  }
  destroy() {
    this.store = {};
  }
}
class NativeScrollManager extends AbstractScrollManager {
  constructor(element) {
    super();
    this.element = element;
    this._throttle = throttle(event => {
      this.handleScrollEvent(event);
    }, 0);
    this.bindEvent();
  }
  bindEvent() {
    if (this.element === document.documentElement) {
      document.addEventListener('scroll', this._throttle, { passive: true });
    } else {
      this.element.addEventListener('scroll', this._throttle, { passive: true });
    }
  }
  scrollTo(xCoord, yCoord, immediate = false) {
    if (yCoord === undefined) {
      yCoord = xCoord;
      xCoord = 0;
    }
    scrollTo(this.element, {
      top: yCoord,
      left: xCoord,
      behavior: immediate ? 'auto' : 'smooth',
    });
  }
  // experimental
  scrollIntoView(element, margin = 40) {
    const rect = element.getBoundingClientRect();
    const containerRect = this.element.getBoundingClientRect();
    if (rect.y < containerRect.y + margin) {
      // upper bound exceeded
      const d = rect.y - containerRect.y;
      this.scrollTo(this.element.scrollTop + d - margin);
    } else if (rect.y + rect.height > containerRect.y + containerRect.height) {
      // lower bound exceeded
      const d = rect.y + rect.height - (containerRect.y + containerRect.height);
      this.scrollTo(this.element.scrollTop + d + margin);
    }
  }
  triggerEvent() {
    if (this.element === document.documentElement) {
      document.dispatchEvent(new Event('scroll'));
    } else {
      this.element.dispatchEvent(new Event('scroll'));
    }
  }
  getScrollTop() {
    return this.element === document ? document.documentElement.scrollTop : this.element.scrollTop;
  }
  getScrollLeft() {
    return this.element === document ? document.documentElement.scrollLeft : this.element.scrollLeft;
  }
  destroy() {
    super.destroy();
    if (this.element === document.documentElement) {
      document.removeEventListener('scroll', this._throttle);
    } else {
      this.element.removeEventListener('scroll', this._throttle);
    }
  }
}

class OverlayScrollManager extends AbstractScrollManager {
  constructor(element) {
    super();
    if (OverlayScrollbars !== null) {
      const el = element === document.documentElement ? document.body : element;
      this.instance = OverlayScrollbars(el, {
        showNativeOverlaidScrollbars: false,
        scrollbars: {
          autoHide: 'move',
        },
      });
      this.element = element;
      this.bindEvent();
    }
  }
  bindEvent() {
    this.instance?.on(
      'scroll',
      throttle(event => {
        this.handleScrollEvent(event);
      }, 200)
    );
  }
  scrollTo(xCoord, yCoord, immediate = false) {
    if (yCoord === undefined) {
      yCoord = xCoord;
      xCoord = 0;
    }
    if (this.element === document.documentElement) {
      this.element.scroll({
        top: yCoord,
        left: xCoord,
        behavior: immediate ? 'auto' : 'smooth',
      });
    } else {
      this.element.querySelector(':scope > .os-viewport')?.scroll({
        top: yCoord,
        left: xCoord,
        behavior: immediate ? 'auto' : 'smooth',
      });
    }
    // this.instance?.scroll({
    //     x: xCoord,
    //     y: yCoord,
    // }, immediate ? 0 : 500, 'easeOutCubic');
  }
  triggerEvent() {
    if (this.element === document.documentElement) {
      document.dispatchEvent(new Event('scroll'));
    } else {
      this.element.dispatchEvent(new Event('scroll'));
    }
  }
  getScrollTop() {
    return this.element === document ? document.documentElement.scrollTop : this.element.scrollTop;
  }
  getScrollLeft() {
    return this.element === document ? document.documentElement.scrollLeft : this.element.scrollLeft;
  }
  destroy() {
    this.instance?.destroy();
    super.destroy();
  }
}
const ScrollManager = config.overlay_scrollbar.enable ? OverlayScrollManager : NativeScrollManager;
export { AbstractScrollManager, ScrollManager, NativeScrollManager, OverlayScrollManager };
export let scrollManager;
if (config.overlay_scrollbar.enable) {
  scrollManager = new OverlayScrollManager(document.documentElement);
} else {
  scrollManager = new NativeScrollManager(document.documentElement);
}
