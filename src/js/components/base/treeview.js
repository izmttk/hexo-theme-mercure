import { animationsComplete, applyTransition } from '../../utils';

class Treeview {
  static defaultTreeviewOptions = {
    // ...
    deselectOnBlur: false,
    onSelect: (item, device) => {},
    onDeselect: (item, device) => {},
    onFocus: (item, device) => {},
    onBlur: (item, device) => {},
    beforeExpand: (item, device) => {},
    beforeCollapse: (item, device) => {},
    afterExpand: (item, device) => {},
    afterCollapse: (item, device) => {},
  };

  constructor(element, options = {}) {
    const combbindOptions = { ...Treeview.defaultTreeviewOptions, ...options };
    this.element = element;
    this.options = combbindOptions;
    this.items = {};
    this.selected = null;
    this.focused = null;

    this._isKeyDown = false;
    this._isMouseDown = false; // to tell if the focus is caused by mouse down
    this._onDocKeyDown = (() => {
      this._isKeyDown = true;
    }).bind(this);
    this._onDocKeyUp = (() => {
      this._isKeyDown = false;
    }).bind(this);
    this._onDocMouseDown = (() => {
      this._isMouseDown = true;
    }).bind(this);
    this._onDocMouseUp = (() => {
      this._isMouseDown = false;
    }).bind(this);

    this._buildTree(this.element);
    this.__onItemClick = this._onItemClick.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    this.__onMouseDown = this._onMouseDown.bind(this);
    this.__onFocus = this._onFocus.bind(this);
    this.__onBlur = this._onBlur.bind(this);
    this._bindEvents();
    for (const id in this.items) {
      const item = this.items[id];
      const contentElement = item.element.querySelector('.treeview-item-content');
      if (item.isExpanded && id !== 'root') {
        item.element.setAttribute('aria-expanded', 'true');
        contentElement.style.visibility = null;
        contentElement.style.height = 'auto';
      }
    }
  }

  _buildTree(rootElement, parentId = null) {
    const children = [];
    const id = parentId ? rootElement.getAttribute('id').replace('treeview-item-', '') : 'root';
    const isExpanded = parentId ? rootElement.classList.contains('expanded') : true;
    const childrenElements = parentId
      ? rootElement.querySelectorAll(':scope > .treeview-item-content > .treeview-item')
      : rootElement.querySelectorAll(':scope > .treeview-item');
    childrenElements.forEach(child => {
      children.push(this._buildTree(child, id));
    });
    this.items[id] = {
      parentId,
      isExpanded: children.length === 0 ? false : isExpanded,
      children,
      element: rootElement,
      isEndpoint: children.length === 0,
    };
    return id;
  }

  _bindEvents() {
    this.element.addEventListener('click', this.__onItemClick);
    this.element.addEventListener('keydown', this.__onKeyDown);
    this.element.addEventListener('focus', this.__onFocus);
    this.element.addEventListener('mousedown', this.__onMouseDown);
    this.element.addEventListener('blur', this.__onBlur);
    document.addEventListener('mousedown', this._onDocMouseDown);
    document.addEventListener('mouseup', this._onDocMouseUp);
    document.addEventListener('keydown', this._onDocKeyDown);
    document.addEventListener('keyup', this._onDocKeyUp);
  }

  _unbindEvents() {
    this.element.removeEventListener('click', this.__onItemClick);
    this.element.removeEventListener('keydown', this.__onKeyDown);
    this.element.removeEventListener('focus', this.__onFocus);
    this.element.removeEventListener('mousedown', this.__onMouseDown);
    this.element.removeEventListener('blur', this.__onBlur);
    document.removeEventListener('mousedown', this._onDocMouseDown);
    document.removeEventListener('mouseup', this._onDocMouseUp);
    document.removeEventListener('keydown', this._onDocKeyDown);
    document.removeEventListener('keyup', this._onDocKeyUp);
  }

  _onKeyDown(event) {
    const key = event.key;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this._focusNext(this.focused ?? 'root', 'keyboard');
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.focused !== null) {
          this._focusPrev(this.focused, 'keyboard');
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.focused !== null) {
          if (this.items[this.focused].isExpanded) {
            this.collapse(this.focused, 'keyboard');
          } else {
            const parent = this.items[this.focused].parentId;
            if (parent !== 'root') {
              this.focus(parent, 'keyboard');
            }
          }
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.focused !== null) {
          if (!this.items[this.focused].isEndpoint) {
            if (!this.items[this.focused].isExpanded) {
              this.expand(this.focused, 'keyboard');
            } else {
              this.focus(this.items[this.focused].children[0], 'keyboard');
            }
          }
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.focused !== null) {
          if (!this.items[this.focused].isEndpoint) {
            this.toggle(this.focused, 'keyboard');
            this.select(this.focused, 'keyboard');
          } else {
            this.select(this.focused, 'keyboard');
          }
        }
        break;
      // case 'Escape':
      //     this.selected !== null && this.deselect(this.selected, 'keyboard');
      //     this.focused !== null && this.blur(this.focused, 'keyboard');
      //     this.element.blur();
      //     event.preventDefault();
      //     break;
      default:
        break;
    }
  }

  _onItemClick(event) {
    // console.log('treeview click');
    const item = event.target.closest('.treeview-item');
    const isItem = item !== null && this.items.hasOwnProperty(item.id.replace('treeview-item-', ''));
    if (isItem) {
      const id = item.getAttribute('id').replace('treeview-item-', '');
      this.toggle(id, 'mouse');
      this.select(id, 'mouse');
      this.focus(id, 'mouse');
    }
  }

  _onMouseDown(event) {
    // Prevent focus on child elements
    event.preventDefault();
    this.element.focus({
      preventScroll: true,
    });
  }

  _onFocus(event) {
    // focus when click will be handled by _onItemClick
    if (this._isKeyDown) {
      if (this.selected) {
        this.focus(this.selected, 'keyboard');
      } else {
        this._focusNext('root', 'keyboard');
      }
    }
  }

  _onBlur(event) {
    const device = this._isKeyDown ? 'keyboard' : 'mouse';
    this.blur(this.focused, device);
    if (this.options.deselectOnBlur) {
      this.deselect(this.selected, device);
    }
  }

  async toggle(id, device) {
    if (!(id in this.items) || this.items[id].isEndpoint) {
      return;
    }
    if (this.items[id].isExpanded) {
      await this.collapse(id, device);
    } else {
      await this.expand(id, device);
    }
  }

  async expand(id, device) {
    if (!(id in this.items) || this.items[id].isEndpoint || this.items[id].isExpanded) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    const contentElement = element.querySelector('.treeview-item-content');

    if (typeof this.options.beforeExpand === 'function') {
      await new Promise(resolve => {
        this.options.beforeExpand(item, device);
        resolve(null);
      });
    }

    this.items[id].isExpanded = true;
    element.classList.add('expanded');
    element.setAttribute('aria-expanded', 'true');
    contentElement.style.visibility = null;

    await applyTransition(contentElement, {
      from: { height: contentElement.offsetHeight + 'px', opacity: 0, transform: 'translateX(10%)' },
      to: { height: contentElement.scrollHeight + 'px', opacity: 1, transform: 'translateX(0)' },
    });

    if (this.items[id]?.isExpanded) {
      contentElement.style.height = 'auto';
      if (typeof this.options.afterExpand === 'function') {
        this.options.afterExpand(item, device);
      }
    }
  }

  async collapse(id, device) {
    if (!(id in this.items) || this.items[id].isEndpoint || !this.items[id].isExpanded) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    const contentElement = element.querySelector('.treeview-item-content');

    if (typeof this.options.beforeCollapse === 'function') {
      await new Promise(resolve => {
        this.options.beforeCollapse(item, device);
        resolve(null);
      });
    }

    element.classList.remove('expanded');
    element.setAttribute('aria-expanded', 'false');
    this.items[id].isExpanded = false;

    await applyTransition(contentElement, {
      from: { height: contentElement.offsetHeight + 'px', opacity: 1, transform: 'translateX(0)' },
      to: { height: '0px', opacity: 0, transform: 'translateX(10%)' },
    });

    if (!this.items[id]?.isExpanded) {
      contentElement.style.visibility = 'hidden';
      if (typeof this.options.afterCollapse === 'function') {
        this.options.afterCollapse(item, device);
      }
    }
  }

  async select(id, device) {
    if (!(id in this.items) || this.selected === id) {
      return;
    }
    if (this.selected) {
      await this.deselect(this.selected, device);
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.add('selected');
    element.setAttribute('aria-selected', 'true');
    this.selected = id;
    if (typeof this.options.onSelect === 'function') {
      this.options.onSelect(item, device);
    }
  }

  async deselect(id, device) {
    if (!(id in this.items) || this.selected !== id) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.remove('selected');
    element.setAttribute('aria-selected', 'false');
    this.selected = null;
    if (typeof this.options.onDeselect === 'function') {
      this.options.onDeselect(item, device);
    }
  }

  async focus(id, device) {
    if (!(id in this.items) || this.focused === id) {
      return;
    }
    if (this.focused) {
      await this.blur(this.focused, device);
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.add('focused');
    this.focused = id;
    if (device === 'keyboard') {
      // scroll into view if needed
      const rect = element.getBoundingClientRect();
      if (
        rect.top < 0 ||
        rect.left < 0 ||
        rect.bottom > document.documentElement.clientHeight ||
        rect.right > document.documentElement.clientWidth
      ) {
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
    if (typeof this.options.onFocus === 'function') {
      this.options.onFocus(item, device);
    }
  }

  async blur(id, device) {
    if (!(id in this.items) || this.focused !== id) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.remove('focused');
    this.focused = null;
    if (typeof this.options.onBlur === 'function') {
      this.options.onBlur(item, device);
    }
  }

  _getPrevSibling(id) {
    if (!(id in this.items)) {
      return null;
    }
    const item = this.items[id];
    const parentId = item.parentId;
    if (!parentId) {
      // is root
      return null;
    }
    const parent = this.items[parentId];
    const index = parent.children.indexOf(id);
    if (index > 0) {
      return parent.children[index - 1];
    }
    return null;
  }

  _getNextSibling(id) {
    if (!(id in this.items)) {
      return null;
    }
    const item = this.items[id];
    const parentId = item.parentId;
    if (!parentId) {
      // is root
      return null;
    }
    const parent = this.items[parentId];
    const index = parent.children.indexOf(id);
    if (index < parent.children.length - 1) {
      return parent.children[index + 1];
    }
    return null;
  }

  _focusPrev(currentId, device) {
    if (!(currentId in this.items)) {
      return;
    }
    const currentItem = this.items[currentId];
    const prevSibling = this._getPrevSibling(currentId);
    if (prevSibling) {
      const prevSiblingItem = this.items[prevSibling];
      if (prevSiblingItem.isExpanded) {
        let lastChild = prevSibling;
        let lastChildItem = prevSiblingItem;
        while (lastChildItem.isExpanded) {
          lastChild = lastChildItem.children[lastChildItem.children.length - 1];
          lastChildItem = this.items[lastChild];
        }
        this.focus(lastChild, device);
      } else {
        this.focus(prevSibling, device);
      }
    } else {
      if (currentItem.parentId !== 'root') {
        this.focus(currentItem.parentId, device);
      }
    }
  }

  _focusNext(currentId, device) {
    if (!(currentId in this.items)) {
      return;
    }
    const currentItem = this.items[currentId];
    if (currentItem.isExpanded) {
      const firstChild = currentItem.children[0];
      this.focus(firstChild, device);
    } else {
      const nextSibling = this._getNextSibling(currentId);
      if (nextSibling) {
        this.focus(nextSibling, device);
      } else {
        let parent = currentItem.parentId;
        while (parent !== null) {
          const nextSibling = this._getNextSibling(parent);
          if (nextSibling) {
            this.focus(nextSibling, device);
            break;
          }
          parent = this.items[parent].parentId;
        }
      }
    }
  }

  async destroy() {
    this._unbindEvents();
    this.items = {};
    this.element = null;
  }
}
export default Treeview;
