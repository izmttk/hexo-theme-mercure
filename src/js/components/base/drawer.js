import { animationsComplete } from '../../utils';
import Popover from './popover';
class Drawer extends Popover {
  static defaultDrawerOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: true, // lock body scroll when popover is opened
    presist: false, // keep drawer in dom once opened
    zIndex: null,
  };
  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Drawer.defaultDrawerOptions, ...options };
    super(element, toggle, {
      prefix: 'drawer',
      backdrop: true,
      closeBtn: true,
      autoFocus: true,
      ...combinedOptions,
    });
    this.anchor = element.classList.contains('drawer-anchor-left') ? 'left' : 'right';
    this._slideInDirection = this.anchor === 'left' ? 'right' : 'left';
    this._slideOutDirection = this.anchor === 'left' ? 'left' : 'right';
  }

  async open() {
    if (!this.isOpened) {
      await super.open();
      const drawerBackdrop = this.mountedPopover.querySelector('.drawer-backdrop');
      const drawerPanel = this.mountedPopover.querySelector('.drawer-panel');
      drawerBackdrop.classList.remove('fade-out');
      drawerPanel.classList.remove(`slide-${this._slideOutDirection}-fade-out`);
      drawerBackdrop.classList.add('fade-in');
      drawerPanel.classList.add(`slide-${this._slideInDirection}-fade-in`);
    }
  }

  async close() {
    if (this.isOpened) {
      const drawerBackdrop = this.mountedPopover.querySelector('.drawer-backdrop');
      const drawerPanel = this.mountedPopover.querySelector('.drawer-panel');
      drawerBackdrop.classList.remove('fade-in');
      drawerPanel.classList.remove(`slide-${this._slideInDirection}-fade-in`);
      drawerBackdrop.classList.add('fade-out');
      drawerPanel.classList.add(`slide-${this._slideOutDirection}-fade-out`);
      await Promise.all([animationsComplete(drawerBackdrop), animationsComplete(drawerPanel)]);
      await super.close();
    }
  }
}

export default Drawer;
