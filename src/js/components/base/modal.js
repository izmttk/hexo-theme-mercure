import { animationsComplete } from '../../utils';
import Popover from './popover';
class Modal extends Popover {
  static defaultModalOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: true, // lock body scroll when popover is opened
    presist: false, // keep modal in dom once opened
    zIndex: null,
  };
  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Modal.defaultModalOptions, ...options };
    super(element, toggle, {
      prefix: 'modal',
      backdrop: true,
      closeBtn: true,
      autoFocus: true,
      ...combinedOptions,
    });
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
      await super.open();
      const modalBackdrop = this.mountedPopover.querySelector('.modal-backdrop');
      const modalPanel = this.mountedPopover.querySelector('.modal-panel');
      modalBackdrop.classList.remove('fade-out');
      modalPanel.classList.remove('slide-down-fade-out');
      modalBackdrop.classList.add('fade-in');
      modalPanel.classList.add('slide-up-fade-in');
    }
  }

  async close() {
    if (this.isOpened) {
      const modalBackdrop = this.mountedPopover.querySelector('.modal-backdrop');
      const modalPanel = this.mountedPopover.querySelector('.modal-panel');
      modalBackdrop.classList.remove('fade-in');
      modalPanel.classList.remove('slide-up-fade-in');
      modalBackdrop.classList.add('fade-out');
      modalPanel.classList.add('slide-down-fade-out');
      await Promise.all([animationsComplete(modalBackdrop), animationsComplete(modalPanel)]);
      await super.close();
    }
  }
}

export default Modal;
