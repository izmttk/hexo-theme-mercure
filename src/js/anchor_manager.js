// anchor 点击事件拦截器
class AnchorManager {
  constructor(element = document.body) {
    this.store = {};
    this.element = element;
    this._handleClick = this._handleClick.bind(this);
    document.addEventListener('click', this._handleClick, true);
    // this.mutationObserver = new MutationObserver(mutations => {
    //     console.log(mutations);
    //     mutations.forEach(mutation => {
    //         mutation.removedNodes.forEach(node => {
    //             if (node instanceof HTMLElement) {
    //                 [...node.querySelectorAll('a[href]')].forEach(item => {
    //                     item.removeEventListener('click', this._handleClick, true);
    //                 });
    //             }
    //         });
    //         mutation.addedNodes.forEach(node => {
    //             if (node instanceof HTMLElement) {
    //                 [...node.querySelectorAll('a[href]')].forEach(item => {
    //                     item.addEventListener('click', this._handleClick, true);
    //                 });
    //             }
    //         });
    //     });
    // });
    // this.mutationObserver.observe(this.element, {childList: true, subtree: true});
  }
  // 监视搜索页面和弹窗中的链接
  _handleClick(event) {
    const target = event.target;
    const anchor = target.closest('a[href]');
    if (anchor instanceof HTMLAnchorElement) {
      // console.log(anchor);
      for (const handler in this.store) {
        this.store[handler](event, anchor);
      }
    }
  }
  // _handleClick() {
  //     for (let handler in this.store) {
  //         Reflect.apply(this.store[handler], this, arguments);
  //     }
  // }
  register(name, fn) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    this.store[name] = fn;
    // [...this.element.querySelectorAll('a[href]')].forEach(item => {
    //     item.addEventListener('click', this._handleClick, true);
    // });
  }
  unregister(name) {
    if (!name) throw new TypeError('name is required');
    // [...this.element.querySelectorAll('a[href]')].forEach(item => {
    //     item.removeEventListener('click', this._handleClick, true);
    // });
    Reflect.deleteProperty(this.store, name);
  }

  destroy() {
    this.store = {};
    // this.mutationObserver.disconnect();
  }
}

export { AnchorManager };
export const anchorManager = new AnchorManager();
