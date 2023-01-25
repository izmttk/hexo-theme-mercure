import { animationsComplete, applyTransition } from '../../utils';

class Accordion {
  static defaultAccordionOptions = {
    // ...
    defaultOpen: false,
    beforeOpen: () => {},
    afterOpen: () => {},
    beforeClose: () => {},
    afterClose: () => {},
  };
  constructor(element, options = {}) {
    const combinedOptions = { ...Accordion.defaultAccordionOptions, ...options };
    this.element = element;
    this.options = combinedOptions;
    this.headerElement = this.element.querySelector('.accordion-header');
    this.contentElement = this.element.querySelector('.accordion-content');
    this.isOpened = false;
    this.__onClick = this._onClick.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    this._bindEvents();

    if (this.element.classList.contains('open') || this.options.defaultOpen) {
      this.open();
    }
  }
  _onClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    this.toggle();
  }
  _onKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggle();
      event.preventDefault();
    }
  }
  _bindEvents() {
    this.headerElement.addEventListener('click', this.__onClick);
    this.headerElement.addEventListener('keydown', this.__onKeyDown);
  }

  _unbindEvents() {
    this.headerElement.removeEventListener('click', this.__onClick);
    this.headerElement.removeEventListener('keydown', this.__onKeyDown);
  }

  async open() {
    if (typeof this.options.beforeOpen === 'function') {
      await new Promise(resolve => {
        this.options.beforeOpen();
        resolve(null);
      });
    }
    this.isOpened = true;
    this.element.classList.add('open');
    this.headerElement.setAttribute('aria-expanded', 'true');
    this.contentElement.style.visibility = null;
    await applyTransition(this.contentElement, {
      from: { height: this.contentElement.offsetHeight + 'px' },
      to: { height: this.contentElement.scrollHeight + 'px' },
    });
    if (this.isOpened) {
      // if not closed again
      this.contentElement.style.height = 'auto';
      if (typeof this.options.afterOpen === 'function') {
        this.options.afterOpen();
      }
    }
  }

  async close() {
    if (typeof this.options.beforeClose === 'function') {
      await new Promise(resolve => {
        this.options.beforeClose();
        resolve(null);
      });
    }
    this.isOpened = false;
    this.element.classList.remove('open');
    this.headerElement.setAttribute('aria-expanded', 'false');
    await applyTransition(this.contentElement, {
      from: { height: this.contentElement.offsetHeight + 'px' },
      to: { height: '0px' },
    });
    if (!this.isOpened) {
      // if not opened again
      this.contentElement.style.visibility = 'hidden'; // to prevent content from being focusable
      if (typeof this.options.afterClose === 'function') {
        this.options.afterClose();
      }
    }
  }

  async toggle() {
    if (this.isOpened) {
      await this.close();
    } else {
      await this.open();
    }
  }

  async destroy() {
    this._unbindEvents();
    this.element = null;
    this.headerElement = null;
    this.contentElement = null;
  }
}

class AccordionGroup {
  static defaultAccordionGroupOptions = {
    allowMultipleOpen: false,
    defaultOpens: [],
  };

  constructor(element, options = {}) {
    const combinedOptions = { ...AccordionGroup.defaultAccordionGroupOptions, ...options };
    this.element = element;
    this.options = combinedOptions;
    this.accordionInstances = [];
    const defaultOpens =
      this.options.allowMultipleOpen && this.options.defaultOpens.length > 0
        ? this.options.defaultOpens
        : [this.options.defaultOpens[0]];
    this.accrodions.forEach((accordion, index) => {
      const accordionInstance = new Accordion(accordion, {
        defaultOpen: defaultOpens.includes(index),
        beforeOpen: async () => {
          await this._closeOthers(index);
        },
      });
      this.accordionInstances.push(accordionInstance);
    });
  }

  get accrodions() {
    return [...this.element.querySelectorAll('.accordion')];
  }

  async _closeOthers(index) {
    if (!this.options.allowMultipleOpen) {
      await Promise.all(
        this.accordionInstances.map(async (accordionInstance, i) => {
          if (i !== index) {
            await accordionInstance.close();
          }
        })
      );
    }
  }

  async open(index) {
    const accordionInstance = this.accordionInstances[index];
    await this._closeOthers(index);
    await accordionInstance.open();
  }

  async close(index) {
    const accordionInstance = this.accordionInstances[index];
    await accordionInstance.close();
  }

  async toggle(index) {
    const accordionInstance = this.accordionInstances[index];
    if (accordionInstance.isOpened) {
      await this.close(index);
    } else {
      await this.open(index);
    }
  }

  async destroy() {
    await Promise.all(this.accordionInstances.map(accrodionInstance => accrodionInstance.destroy()));
    this.accordionInstances = [];
    this.element = null;
  }
}

export { Accordion, AccordionGroup };
