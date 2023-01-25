import NProgress from 'nprogress';
import { applyAnimation } from '../utils';

class Loading {
  static defaultOptions = {
    defaultOpen: false,
  };
  constructor(element, options = {}) {
    const combinedOptions = { ...Loading.defaultOptions, ...options };
    this.element = element ?? document.querySelector('.loading');
    this.options = combinedOptions;
    this.isOpened = false;
    if (this.options.defaultOpen) {
      setTimeout(() => {
        NProgress.start();
      }, 0);
      this.element.style.display = '';
      this.isOpened = true;
    } else {
      this.element.style.display = 'none';
    }
    // performace of NProgress is not good
    // NProgress.configure({
    //     trickleSpeed: 200,
    //     showSpinner: false
    // });
  }
  async show() {
    if (this.isOpened) return;
    this.isOpened = true;
    // console.log('show',this);
    // this.element.style.visibility = 'visible';
    this.element.style.display = '';
    // document.body.style.overflow = 'hidden';
    setTimeout(() => {
      NProgress.start();
    }, 0);
    await applyAnimation(this.element, {
      className: 'fade-in',
      duration: 500,
    });
    // this.element.classList.add('fade-in');
  }

  async hide() {
    // console.log('hide',this);
    if (!this.isOpened) return;
    setTimeout(() => {
      NProgress.done();
    }, 0);
    // document.body.style.overflow = '';
    await applyAnimation(this.element, {
      className: 'fade-out',
      duration: 500,
    });
    // this.element.style.visibility = 'hidden';
    this.element.style.display = 'none';

    this.isOpened = false;
  }

  async destroy() {
    this.element = null;
  }
}

export default Loading;
