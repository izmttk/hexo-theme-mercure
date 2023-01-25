import { debounce, focusTrap } from '../../utils';

class Popover {
  static defaultPopoverOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: true, // lock body scroll when popover is opened
    presist: false, // keep popover in dom once opened
    prefix: 'popover', // prefix for popover class
    backdrop: true, // has backdrop
    closeBtn: true, // has close button
    autoFocus: true, // auto focus on first focusable element
    trigger: 'click', // popover trigger
    hoverOpenDelay: 0, // delay before popover open on hover
    hoverCloseDelay: 250, // delay before popover close on hover
    zIndex: null, // popover z-index
    defaultOpen: false, // open popover by default
  };
  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Popover.defaultPopoverOptions, ...options };
    this.popoverTemplate = element;
    this.toggleEl = toggle;
    this.mountedPopover = null;
    this.isOpened = false;
    this.options = combinedOptions;
    this._prevFocus = null;
    this.__close = this.close.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    this.__onToggleClick = this._onToggleClick.bind(this);
    this.__onToggleKeyDown = this._onToggleKeyDown.bind(this);
    this.__onMouseEnter = this._onMouseEnter.bind(this);
    this.__onMouseLeave = this._onMouseLeave.bind(this);
    this._openDebounce = debounce(this.open.bind(this), this.options.hoverOpenDelay);
    this._closeDebounce = debounce(this.close.bind(this), this.options.hoverCloseDelay);
    if (this.options.presist) {
      this._mount();
      this._setUnaccessable();
    }
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.addEventListener('click', this.__onToggleClick);
      if (this.options.trigger === 'hover') {
        this.toggleEl.addEventListener('mouseenter', this.__onMouseEnter);
        this.toggleEl.addEventListener('mouseleave', this.__onMouseLeave);
      }
      this.toggleEl.addEventListener('keydown', this.__onToggleKeyDown);
    }

    if (this.popoverTemplate.classList.contains('open') || this.options.defaultOpen) {
      this.open();
    }
  }
  _onToggleKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggle();
      event.preventDefault();
    }
  }

  _onToggleClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    this.toggle();
  }

  _onMouseEnter(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    this._closeDebounce.cancel();
    this._openDebounce();
  }

  _onMouseLeave(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    this._openDebounce.cancel();
    this._closeDebounce();
  }

  _bindEvents() {
    if (this.mountedPopover) {
      if (this.options.closeBtn) {
        const popoverCloseBtn = this.mountedPopover.querySelector(`.${this.options.prefix}-close-btn`);
        popoverCloseBtn.addEventListener('click', this.__close);
      }
      if (this.options.backdrop) {
        const popoverBackdrop = this.mountedPopover.querySelector(`.${this.options.prefix}-backdrop`);
        popoverBackdrop.addEventListener('click', this.__close);
      }
      this.mountedPopover.addEventListener('keydown', this.__onKeyDown);
      if (this.options.trigger === 'hover') {
        this.mountedPopover.addEventListener('mouseenter', this.__onMouseEnter);
        this.mountedPopover.addEventListener('mouseleave', this.__onMouseLeave);
      }
    }
  }

  _unbindEvents() {
    if (this.mountedPopover) {
      if (this.options.closeBtn) {
        const popoverCloseBtn = this.mountedPopover.querySelector(`.${this.options.prefix}-close-btn`);
        popoverCloseBtn.removeEventListener('click', this.__close);
      }
      if (this.options.backdrop) {
        const popoverBackdrop = this.mountedPopover.querySelector(`.${this.options.prefix}-backdrop`);
        popoverBackdrop.removeEventListener('click', this.__close);
      }
      this.mountedPopover.removeEventListener('keydown', this.__onKeyDown);
      if (this.options.trigger === 'hover') {
        this.mountedPopover.removeEventListener('mouseenter', this.__onMouseEnter);
        this.mountedPopover.removeEventListener('mouseleave', this.__onMouseLeave);
      }
    }
  }

  _onKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      focusTrap(this.mountedPopover, event);
    }
    event.stopPropagation();
  }

  _autoFocus() {
    if (this.mountedPopover) {
      const autofocus = this.mountedPopover.querySelector('[autofocus]');
      if (autofocus) {
        autofocus.focus();
      }
    }
  }

  _mount() {
    if (!this.mountedPopover) {
      // this.mountedPopover = this.popoverTemplate.cloneNode(true);
      this.mountedPopover = this.popoverTemplate;
      this.mountedPopover.style.zIndex = this.options.zIndex;
      this.options.mountTo.append(this.mountedPopover);
      this._bindEvents();
    }
  }

  _unmount() {
    if (this.mountedPopover) {
      this._unbindEvents();
      this.mountedPopover.remove();
      this.mountedPopover = null;
    }
  }

  _setAccessable() {
    if (this.mountedPopover) {
      // set tabindex to 0 and remove aria-hidden
      this.mountedPopover.setAttribute('tabindex', '0');
      this.mountedPopover.removeAttribute('aria-hidden');
      this.mountedPopover.style.display = '';
      this._bindEvents();
    }
  }

  _setUnaccessable() {
    if (this.mountedPopover) {
      // set tabindex to -1 and add aria-hidden
      this.mountedPopover.setAttribute('tabindex', '-1');
      this.mountedPopover.setAttribute('aria-hidden', 'true');
      this.mountedPopover.style.display = 'none';
      this._unbindEvents();
    }
  }

  async toggle() {
    if (this.isOpened) {
      await this.close();
    } else {
      await this.open();
    }
  }

  async open() {
    if (!this.isOpened) {
      this._prevFocus = document.activeElement; // save previous focus
      if (this.options.scrollLock) {
        document.body.style.overflow = 'hidden';
      }
      if (this.options.presist) {
        this._setAccessable();
      } else {
        this._mount();
      }
      this.mountedPopover.classList.add('open');
      if (this.options.autoFocus) {
        this._autoFocus();
      }
      this.isOpened = true;
    }
  }

  async close() {
    if (this.isOpened) {
      if (this.options.scrollLock) {
        document.body.style.overflow = '';
      }
      this.isOpened = false;
      if (this._prevFocus instanceof HTMLElement) {
        this._prevFocus.focus({
          preventScroll: true,
        });
      }
      this.mountedPopover.classList.remove('open');
      if (this.options.presist) {
        this._setUnaccessable();
      } else {
        this._unmount();
      }
    }
  }

  async destroy() {
    await this.close();
    this._unmount();
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.removeEventListener('keydown', this.__onToggleKeyDown);
      this.toggleEl.removeEventListener('click', this.__onToggleClick);
      if (this.options.trigger === 'hover') {
        this.toggleEl.removeEventListener('mouseenter', this.__onMouseEnter);
        this.toggleEl.removeEventListener('mouseleave', this.__onMouseLeave);
      }
    }
    this.toggleEl = null;
  }
}

export default Popover;
