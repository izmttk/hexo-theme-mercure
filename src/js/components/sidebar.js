import Toc from './toc';
import Tabs from './base/tabs';
import Treeview from './base/treeview';

class Sidebar {
  constructor(element = document.querySelector('#sidebar')) {
    this.init(element);
  }

  init(element = document.querySelector('#sidebar')) {
    this.rootElement = element;
    this._hasProfile = false;
    this._hasTocView = false;
    this._hasTabs = false;
    this._hasCategoryTree = false;
    this._initConFetti();
    this._initCategoryTree();
    this._initTabs();
    if (this._hasTabs) {
      this._initTocView();
    }
  }

  async _onProfileAvatarClick(event) {
    if (event.target instanceof HTMLElement) {
      const confetti = (await import('canvas-confetti')).default;
      const rect = event.target.getBoundingClientRect();
      const x = (rect.x + rect.width / 2) / document.documentElement.clientWidth;
      const y = (rect.y + rect.height / 2) / document.documentElement.clientHeight;
      confetti({
        particleCount: 100,
        spread: 70,
        startVelocity: 30,
        origin: {
          x,
          y
        },
        zIndex: 99999
      })
    }
  }

  _initConFetti() {
    const profileElement = this.rootElement?.querySelector('.profile');
    if (profileElement) {
      this._hasProfile = true;
      this.avatarElement = profileElement?.querySelector('.avatar');
      this.avatarElement?.addEventListener('click', this._onProfileAvatarClick);
    }
  }

  _initTabs() {
    const tabsElement = this.rootElement?.querySelector('.sidebar-tabs');
    if (tabsElement !== null) {
      this._hasTabs = true;
      this.tabsIns = new Tabs(tabsElement);
    }
  }

  _initTocView() {
    const postElement = document.querySelector('#main .page');
    const tocElement = this.rootElement?.querySelector('.toc-view > .toc');
    const containerElement = this.rootElement?.querySelector('.tabs-body');
    if (tocElement && postElement && containerElement) {
      this._hasTocView = true;
      this.tocIns = new Toc(postElement, tocElement, containerElement);
    }
  }

  _initCategoryTree() {
    const element = this.rootElement?.querySelector('.category-tree > .treeview');
    if (element) {
      this._hasCategoryTree = true;
      this.TreeviewIns = new Treeview(element, {
        deselectOnBlur: true,
        onSelect: (item, device) => {
          if (device === 'keyboard') {
            const link = item.element.querySelector('a');
            if (link !== null) {
              link.click();
            }
          }
        },
        onFocus: (item, device) => {
          // scroll into view if needed
          // align to bottom cause the navbar is fixed
          if (device === 'keyboard') {
            const rect = element.getBoundingClientRect();
            if (
              rect.top < 40 ||
              rect.left < 0 ||
              rect.bottom > document.documentElement.clientHeight ||
              rect.right > document.documentElement.clientWidth
            ) {
              element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
          }
        },
      });
    }
  }

  async reset(element = document.querySelector('#sidebar')) {
    await this.destroy();
    this.init(element);
  }

  async destroy() {
    await Promise.all([
      this._hasProfile ? (() => {
        this.avatarElement?.removeEventListener('click', this._onProfileAvatarClick);
        this.avatarElement = null;
      })() : null,
      this._hasTabs ? this.tabsIns?.destroy() : null,
      this._hasTocView ? this.tocIns?.destroy() : null,
      this._hasCategoryTree ? this.TreeviewIns?.destroy() : null,
    ]);
  }
}

export default Sidebar;
