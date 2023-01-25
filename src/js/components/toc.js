import { ScrollManager } from '../scroll_manager';
import { isVisible } from '../utils';
import scrollIntoView from 'scroll-into-view-if-needed';

class Toc {
  constructor(postElement, tocElement, containerElement) {
    this.rootElement = tocElement;
    let observedTitle = [...postElement.querySelectorAll('h2,h3,h4,h5,h6')];
    this.tocItem = new Map();

    let tocItem = [...tocElement.querySelectorAll('.toc a[href]')];
    for (let index = 0; index < tocItem.length; index++) {
      const element = tocItem[index];
      let name = element.getAttribute('href').substr(1); // remove # characters
      name = decodeURI(name);
      if (name.length > 0) {
        this.tocItem.set(name, {
          index: index,
          element: element,
        });
      }
    }
    this.containerElement = containerElement;
    this._tocObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          const name = entry.target.id;
          if (entry.intersectionRatio === 1) {
            // console.log('enter', entry);
            this._activateTocItem(name);
            // check if an element is visible
            if (isVisible(this.rootElement)) {
              // console.log('scroll into view');
              this._scrollIntoView(name);
            }
          } else {
            // console.log('leave', entry);
            this._deactivateTocItem(name);
          }
        });
      },
      { threshold: 1 }
    );
    observedTitle.forEach(item => {
      this._tocObserver.observe(item);
    });
    this.activedTocItem = new Set();
  }
  _activateTocItem(name) {
    name = decodeURI(name);
    let item = this.tocItem.get(name);
    if (item) {
      this.activedTocItem.add(item);
      this._clearActiveClass();
      this._setActiveClass();
    }
  }
  _deactivateTocItem(name) {
    name = decodeURI(name);
    let item = this.tocItem.get(name);
    if (item) {
      if (this.activedTocItem.size > 1) {
        this._clearActiveClass();
      }
      this.activedTocItem.delete(item);
      this._setActiveClass();
    }
  }
  _clearActiveClass() {
    this.tocItem.forEach(item => {
      item.element.classList.remove('toc-active');
    });
  }
  _setActiveClass() {
    let minIndexItem = null;
    this.activedTocItem.forEach(item => {
      if (minIndexItem === null) {
        minIndexItem = item;
      } else {
        minIndexItem = minIndexItem.index < item.index ? minIndexItem : item;
      }
    });
    if (minIndexItem !== null) {
      minIndexItem.element.classList.add('toc-active');
    }
  }
  _scrollIntoView(name) {
    const item = this.tocItem.get(decodeURI(name));
    scrollIntoView(item.element, {
      scrollMode: 'if-needed',
      behavior: 'smooth',
      block: 'nearest',
      boundary: this.containerElement,
    });
  }
  async destroy() {
    this._tocObserver.disconnect();
    this.tocItem.clear();
    this.activedTocItem.clear();
  }
}

export default Toc;
