import config from '../configure';
import { scrollManager } from '../scroll_manager';

class Fabs {
  constructor(element = document.querySelector('.fabs')) {
    this._handleScroll = this._handleScroll.bind(this);
    scrollManager.register('fabs', this._handleScroll);
    this._backToTop = () => {
      scrollManager.scrollTo(0);
    };
    this._goToComment = () => {
      const commentEl = document.querySelector('.comments');
      if (commentEl instanceof HTMLElement) {
        scrollManager.scrollTo(commentEl.offsetTop - 64);
      }
    };
    this.init(element);
  }

  init(element = document.querySelector('.fabs')) {
    this.rootElement = element;
    this.gotoTopBtn = this.rootElement?.querySelector('#goto-top-btn');
    this.gotoCommentBtn = this.rootElement?.querySelector('#goto-comment-btn');
    if (config.fabs.goto_top.enable && this.gotoTopBtn) {
      this._initGotoTopBtn();
    }
    if (config.fabs.goto_comment.enable && this.gotoCommentBtn) {
      this._initGotoCommentBtn();
    }
  }

  _handleScroll(event) {
    if (scrollManager.getScrollTop() > 20) {
      this.rootElement?.classList.remove('fabs-hidden');
    } else {
      this.rootElement?.classList.add('fabs-hidden');
    }
  }

  _initGotoTopBtn() {
    this.gotoTopBtn?.addEventListener('click', this._backToTop);
  }

  _initGotoCommentBtn() {
    this.gotoCommentBtn?.addEventListener('click', this._goToComment);
  }

  async reset(element = document.querySelector('.fabs')) {
    this.gotoTopBtn?.removeEventListener('click', this._backToTop);
    this.gotoCommentBtn?.removeEventListener('click', this._goToComment);
    this.rootElement = null;
    this.gotoTopBtn = null;
    this.gotoCommentBtn = null;
    this.init(element);
  }

  async destroy() {
    scrollManager.unregister('fabs');
    this.gotoTopBtn?.removeEventListener('click', this._backToTop);
    this.gotoCommentBtn?.removeEventListener('click', this._goToComment);
    this.rootElement = null;
    this.gotoTopBtn = null;
    this.gotoCommentBtn = null;
  }
}

export default Fabs;
