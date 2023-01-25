import { animationsComplete, applyTransition, finishAnimations, isVisible } from '../../utils';
class Tabs {
  static defaultTabOptions = {
    defaultActivate: 0,
  };
  constructor(element, options = {}) {
    const combinedOptions = { ...Tabs.defaultTabOptions, ...options };
    this.element = element;
    this.options = combinedOptions;
    this.headerElement = this.element.querySelector('.tabs-header');
    this.bodyElement = this.element.querySelector('.tabs-body');
    this.gliderElement = this.element.querySelector('.tabs-glider');
    this.animationPromises = [];
    this.activatedTab = this.options.defaultActivate;
    this.__onTabClick = this._onTabClick.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    // delay init until visible
    this._visibleObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this._init();
          this._visibleObserver.disconnect();
        }
      });
    });
    this._bindEvents();
  }
  get tabs() {
    return [...this.element.querySelectorAll('.tabs-header .tab')];
  }
  get panels() {
    return [...this.element.querySelectorAll('.tabs-body .tab-panel')];
  }

  _init() {
    // initial style
    this.panels.forEach((panel, index) => {
      if (index !== 0) {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'block';
      }
    });
    const tab = this.tabs[this.activatedTab];
    const panel = this.panels[this.activatedTab];
    tab.classList.add('active');
    panel.classList.add('active');
    tab.setAttribute('aria-selected', true);
    this.headerElement.setAttribute('aria-labelledby', tab.id);
    this.gliderElement.style.width = tab.offsetWidth + 'px';
    this.gliderElement.style.left = tab.offsetLeft + 'px';
  }

  _onTabClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    const target = event.target;
    const closetTab = target.closest('.tab');
    if (this.tabs.includes(closetTab)) {
      const index = this.tabs.indexOf(closetTab);
      this.activateTab(index);
    }
  }

  _onKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    const target = event.target;
    if (target.classList.contains('tab') && this.tabs.includes(target)) {
      let nextIndex = this.activatedTab;
      switch (event.key) {
        case 'Enter':
        case ' ':
          nextIndex = this.tabs.indexOf(target);
          break;
        case 'ArrowLeft':
          nextIndex = (this.activatedTab - 1 + this.tabs.length) % this.tabs.length;
          break;
        case 'ArrowRight':
          nextIndex = (this.activatedTab + 1 + this.tabs.length) % this.tabs.length;
          break;
        default:
          return;
      }
      event.preventDefault();
      this.activateTab(nextIndex);
    }
  }

  _bindEvents() {
    this.headerElement.addEventListener('click', this.__onTabClick);
    this.headerElement.addEventListener('keydown', this.__onKeyDown);
    this._visibleObserver.observe(this.element);
  }
  _unbindEvents() {
    this.headerElement.removeEventListener('click', this.__onTabClick);
    this.headerElement.removeEventListener('keydown', this.__onKeyDown);
    this._visibleObserver.disconnect();
  }

  async _enterAnimation(index, oldIndex) {
    const panel = this.panels[index];
    const oldPanel = this.panels[oldIndex];
    panel.style.position = 'absolute';
    panel.style.display = 'block';
    this.bodyElement.style.overflow = 'hidden';
    await Promise.all([
      applyTransition(panel, {
        from: {
          transform: index > oldIndex ? 'translateX(100%)' : 'translateX(-100%)',
          opacity: 0,
        },
        to: {
          transform: 'translateX(0)',
          opacity: 1,
        },
      }),
      applyTransition(this.bodyElement, {
        from: {
          height: oldPanel.offsetHeight + 'px',
        },
        to: {
          height: panel.offsetHeight + 'px',
        },
      }),
    ]);
    panel.style.position = null;
    panel.style.transform = null;
    panel.style.opacity = null;
    this.bodyElement.style.height = null;
    this.bodyElement.style.overflow = null;
  }

  async _leaveAnimation(index, oldIndex) {
    const oldPanel = this.panels[oldIndex];
    oldPanel.style.position = 'absolute';
    await applyTransition(oldPanel, {
      from: {
        transform: 'translateX(0)',
        opacity: 1,
      },
      to: {
        transform: index > oldIndex ? 'translateX(-100%)' : 'translateX(100%)',
        opacity: 0,
      },
    }),
      (oldPanel.style.display = 'none');
    oldPanel.style.position = null;
    oldPanel.style.transform = null;
    oldPanel.style.opacity = null;
  }

  async activateTab(index) {
    if (index === this.activatedTab) {
      return;
    }
    const tab = this.tabs[index];
    const oldTab = this.tabs[this.activatedTab];
    const panel = this.panels[index];
    const oldPanel = this.panels[this.activatedTab];
    tab.classList.add('active');
    panel.classList.add('active');
    oldTab.classList.remove('active');
    oldPanel.classList.remove('active');
    tab.setAttribute('aria-selected', true);
    oldTab.setAttribute('aria-selected', false);
    this.headerElement.setAttribute('aria-labelledby', tab.id);

    this.gliderElement.style.width = tab.getBoundingClientRect().width + 'px';
    this.gliderElement.style.left = tab.offsetLeft + 'px';

    const oldIndex = this.activatedTab;
    this.activatedTab = index;
    tab.focus();
    await this._finishAllAnimations();
    this.animationPromises.push(this._leaveAnimation(index, oldIndex));
    this.animationPromises.push(this._enterAnimation(index, oldIndex));
    await Promise.all(this.animationPromises);
  }

  async _finishAllAnimations() {
    this.panels.forEach((panel, index) => {
      finishAnimations(panel);
    });
    await Promise.all(this.animationPromises);
    this.animationPromises = [];
  }

  async destroy() {
    this._unbindEvents();
    this.element = null;
    this.headerElement = null;
    this.bodyElement = null;
  }
}

export default Tabs;
