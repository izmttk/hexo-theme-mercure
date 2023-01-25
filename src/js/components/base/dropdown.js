import { computePosition, autoUpdate, flip, shift, limitShift, offset, hide } from '@floating-ui/dom';
import { animationsComplete, applyTransition } from '../../utils';
import Popover from './popover';
class Dropdown extends Popover {
  // default options
  static defaultDropdownOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: false, // lock body scroll when popover is opened
    presist: false, // keep modal in dom once opened
    placement: 'bottom-start', // popover placement
    flip: true, // flip popover placement if not enough space
    shift: true, // shift popover placement if not enough space
    offset: 4, // popover offset
    closeWhenInvisible: false, // close popover when target is invisible,
    autoClose: false, // close popover after click inside
    trigger: 'click', // popover trigger
    zIndex: null,
  };

  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Dropdown.defaultDropdownOptions, ...options };
    super(element, toggle, {
      prefix: 'dropdown',
      backdrop: false,
      closeBtn: false,
      autoFocus: false,
      mountTo: combinedOptions.mountTo,
      scrollLock: combinedOptions.scrollLock,
      presist: combinedOptions.presist,
      trigger: combinedOptions.trigger,
      zIndex: combinedOptions.zIndex,
    });
    this.options = {
      ...combinedOptions,
      ...this.options,
    };
    this.element = element;
    this.itemSelector = ':scope > .dropdown-panel > .dropdown-item';
    this.activeItem = null;
    this._middleware = [];
    if (this.options.flip) {
      this._middleware.push(flip());
    }
    if (this.options.shift) {
      this._middleware.push(
        shift({
          crossAxis: true,
          limiter: limitShift(),
        })
      );
    }
    if (this.options.offset !== 0) {
      this._middleware.push(offset(this.options.offset));
    }
    if (this.options.closeWhenInvisible) {
      this._middleware.push(hide());
    }
    this._cleanupAutoUpdate = null;
    this.__clickToClose = this._clickToClose.bind(this);
    this.__onItemMouseEnter = this._onItemMouseEnter.bind(this);
    this.__onItemMouseLeave = this._onItemMouseLeave.bind(this);
  }

  get allItems() {
    return [...this.mountedPopover.querySelectorAll(this.itemSelector)];
  }

  _bindEvents() {
    // override
    super._bindEvents();
    document.addEventListener('click', this.__clickToClose);
    this.allItems.forEach(item => {
      item.addEventListener('mouseenter', this.__onItemMouseEnter);
      item.addEventListener('mouseleave', this.__onItemMouseLeave);
      item.addEventListener('click', this.__clickToClose);
    });
  }

  _unbindEvents() {
    // override
    super._unbindEvents();
    document.removeEventListener('click', this.__clickToClose);
    this.allItems.forEach(item => {
      item.removeEventListener('mouseenter', this.__onItemMouseEnter);
      item.removeEventListener('mouseleave', this.__onItemMouseLeave);
      item.removeEventListener('click', this.__clickToClose);
    });
  }

  _onToggleKeyDown(event) {
    // override
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      this.toggle();
      if (this.allItems.length > 0) {
        this._activateItem(this.allItems[0]);
        this.allItems[0].firstElementChild.focus();
      }
      event.preventDefault();
    }
  }

  _clickToClose(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (this.isOpened) {
      if (
        this.options.autoClose &&
        this.mountedPopover.contains(event.target) &&
        !this.toggleEl.contains(event.target)
      ) {
        this.close();
      }
      if (!this.mountedPopover.contains(event.target) && !this.toggleEl.contains(event.target)) {
        this.close();
      }
    }
  }

  _onItemMouseEnter(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (this.allItems.includes(event.target)) {
      this._activateItem(event.target);
    }
  }

  _onItemMouseLeave(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (this.allItems.includes(event.target)) {
      this._deactivateItem(event.target);
    }
  }

  _onKeyDown(event) {
    // override
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    super._onKeyDown(event);
    if (event.key === 'ArrowDown') {
      // find next item and activate it
      this._activateNextItem();
      event.preventDefault();
    }
    if (event.key === 'ArrowUp') {
      // find prev item and activate it
      this._activatePrevItem();
      event.preventDefault();
    }
    if (event.key === 'Tab' || event.key === 'ArrowLeft') {
      this.close();
    }
  }

  _activateItem(item) {
    if (this.activeItem) {
      this.activeItem.classList.remove('active');
    }
    this.activeItem = item;
    this.activeItem.classList.add('active');
  }

  _deactivateItem(item) {
    if (item) {
      item.classList.remove('active');
    } else {
      if (this.activeItem) {
        this.activeItem.classList.remove('active');
      }
    }
    this.activeItem = null;
  }

  _activateNextItem() {
    const items = this.allItems;
    if (items.length === 0) {
      return;
    }
    let index = 0;
    if (this.activeItem) {
      index = Array.from(items).indexOf(this.activeItem);
      index = (index + 1) % items.length;
      this._activateItem(items[index]);
      items[index].firstElementChild.focus();
    } else {
      this._activateItem(items[0]);
      items[0].firstElementChild.focus();
    }
  }

  _activatePrevItem() {
    const items = this.allItems;
    if (items.length === 0) {
      return;
    }
    let index = items.length - 1;
    if (this.activeItem) {
      index = Array.from(items).indexOf(this.activeItem);
      index = (index - 1 + items.length) % items.length;
      this._activateItem(items[index]);
      items[index].firstElementChild.focus();
    } else {
      this._activateItem(items[items.length - 1]);
      items[items.length - 1].firstElementChild.focus();
    }
  }

  async open() {
    // override
    if (!this.isOpened) {
      // console.log('open', this);
      await super.open();
      this.mountedPopover.style.pointerEvents = 'none';
      const panel = this.mountedPopover.querySelector('.dropdown-panel');
      const update = async () => {
        if (this.mountedPopover) {
          const strategy = window.getComputedStyle(this.mountedPopover)['position'] === 'fixed' ? 'fixed' : 'absolute';

          const { x, y, middlewareData } = await computePosition(this.toggleEl, this.mountedPopover, {
            placement: this.options.placement,
            strategy: strategy,
            middleware: this._middleware,
          });
          this.mountedPopover.style.left = `${x}px`;
          this.mountedPopover.style.top = `${y}px`;
          // bounding rect relative to viewport
          const rectToggle = this.toggleEl.getBoundingClientRect();
          const rectPopover = this.mountedPopover.getBoundingClientRect();
          const offsetX = rectToggle.x - rectPopover.x + rectToggle.width / 2;
          const offsetY = rectToggle.y - rectPopover.y + rectToggle.height / 2;
          panel.style.transformOrigin = `${offsetX}px ${offsetY}px`;

          if (this.options.closeWhenInvisible) {
            const { referenceHidden } = middlewareData.hide;
            if (referenceHidden) {
              await super.close(); // no animation
            }
          }
        }
      };
      await update();
      await applyTransition(panel, {
        transition: 'transform .1s ease-out, opacity .1s ease-out',
        from: {
          opacity: 0,
          transform: 'scale(.9)',
        },
        to: {
          opacity: 1,
          transform: 'scale(1)',
        },
      });

      this._cleanupAutoUpdate = autoUpdate(this.toggleEl, this.mountedPopover, update);
      this.mountedPopover.style.pointerEvents = '';
    }
  }

  async close() {
    // override
    if (this.isOpened) {
      // console.log('closing', this);
      if (this._cleanupAutoUpdate) {
        this._cleanupAutoUpdate();
      }
      this._deactivateItem();
      const panel = this.mountedPopover.querySelector('.dropdown-panel');
      await applyTransition(panel, {
        transition: 'transform .075s ease-out, opacity .075s ease-out',
        from: {
          opacity: 1,
          transform: 'scale(1)',
        },
        to: {
          opacity: 0,
          transform: 'scale(.9)',
        },
      });
      await super.close();
    }
  }
}

class CascadeDropdown {
  static defaultOptions = {
    rootDropdownOptions: {
      placement: 'bottom-start',
      offset: 4,
    },
    childDropdownOptions: {
      placement: 'right-start',
      offset: -8,
    },
  };
  constructor(element, toggleEl, options) {
    this.element = element;
    this.toggleEl = toggleEl;
    const { rootDropdownOptions, childDropdownOptions, ...newOptions } = options ?? {};
    this.rootDropdownOptions = {
      ...CascadeDropdown.defaultOptions.rootDropdownOptions,
      ...rootDropdownOptions,
      ...newOptions,
    };
    this.childDropdownOptions = {
      ...CascadeDropdown.defaultOptions.childDropdownOptions,
      ...childDropdownOptions,
      ...newOptions,
    };
    this.dropdowns = {};
    this.__onToggleClick = this._onToggleClick.bind(this);
    // this.toggleEl.addEventListener('click', this.__onToggleClick);
    this.initDropdowns();
  }
  _onToggleClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    const rootDropdown = this.dropdowns['root'];
    if (rootDropdown) {
      rootDropdown.toggle();
    }
  }
  recurseInit(id, element, toggle, depth = 0) {
    if (depth >= 16) return; // max depth limit is 16
    // console.log('recurseInit', name, element, toggle);
    const submenuItems = element.querySelectorAll('.dropdown-panel > .dropdown-item.dropdown-submenu');
    submenuItems.forEach(submenuItem => {
      const submenuToggle = submenuItem.querySelector('button');
      const submenuId = submenuToggle.getAttribute('id').replace('dropdown-toggle-', '');
      const submenuEl = this.element.querySelector(`#dropdown-${submenuId}`);
      this.recurseInit(submenuId, submenuEl, submenuToggle, depth + 1);
    });
    this.dropdowns[id] = new Dropdown(
      element,
      toggle,
      id === 'root'
        ? this.rootDropdownOptions
        : {
            mountTo: toggle.parentElement,
            ...this.childDropdownOptions,
          }
    );
  }
  initDropdowns() {
    const rootToggle = this.toggleEl;
    const rootId = 'root';
    const rootEl = this.element.querySelector(`#dropdown-${rootId}`);
    this.recurseInit(rootId, rootEl, rootToggle);
  }
  async openRoot() {
    await this.dropdowns['root'].open();
  }
  async openAll() {
    for (const id in this.dropdowns) {
      await this.dropdowns[id].open();
    }
  }
  async closeAll() {
    for (const id in this.dropdowns) {
      await this.dropdowns[id].close();
    }
  }
  async open(id) {
    // id is a string of hashcode
    if (id in this.dropdowns) {
      await this.dropdowns[id].open();
    }
  }
  async close(id) {
    if (id in this.dropdowns) {
      await this.dropdowns[id].close();
    }
  }
  async destroy() {
    await Promise.all(Object.values(this.dropdowns).map(dropdown => dropdown.destroy()));
    this.dropdowns = {};
    this.element = null;
    this.toggleEl = null;
  }
}

export { Dropdown, CascadeDropdown };
