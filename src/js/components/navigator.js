import Search from './search';
import Drawer from './base/drawer';
import { scrollManager } from '../scroll_manager';
import colorMode from '../color_mode';
import config from '../configure';
import Sidebar from './sidebar';
import { CascadeDropdown } from './base/dropdown';
import Toastify from 'toastify-js';

class Navigator {
  constructor(element = document.querySelector('#navigator')) {
    this.leftDropdownIns = null;
    this.rightDrawerIns = null;
    this.rightDrawerSideBarIns = null;
    this.colorModeBtnIns = null;
    this.menuInses = [];
    this.searchIns = null;
    this._onScroll = this._onScroll.bind(this);
    this._bindScrollListener();
    this.init(element);
  }

  init(element = document.querySelector('#navigator')) {
    this.rootElement = element;
    this.menuElement = this.rootElement?.querySelector('.nav-menu');
    this.logoElement = this.rootElement?.querySelector('.nav-logo');
    this.toolElement = this.rootElement?.querySelector('.nav-toolkit');

    this._initMenu();
    this._initTool();
    this.updateMenuIndicator();
    this.show();
    this._onScroll();
  }
  _onScroll(event) {
    if (!(this.rootElement instanceof HTMLElement)) return;
    const navbarHeight = this.rootElement.offsetHeight;
    let sidebar = null;
    if (config.sidebar.enable) {
      sidebar = document.querySelector('#sidebar');
    }
    let header = null;
    if (config.header.enable) {
      header = document.querySelector('#header');
    }
    const throttleHeight = config.header.enable && header instanceof HTMLElement 
      ? (header.offsetHeight  - navbarHeight ?? 0) 
      : 30;
    const scrollTop = scrollManager.getScrollTop();

    if (scrollTop <= 30) {
      this.show();
      this.rootElement.classList.remove('nav-fix');
      this.rootElement.classList.remove('nav-transparent');
      this.rootElement.classList.add('nav-top');
      if (config.header.enable) {
        this.rootElement.classList.add('nav-transparent');
      }
      if (config.sidebar.enable) {
        sidebar?.querySelector('.sidebar-content')?.classList.remove('headblank');
      }
    } else {
      this.rootElement.classList.remove('nav-top');
      this.rootElement.classList.remove('nav-transparent');
      this.rootElement.classList.add('nav-fix');
      if (scrollTop - this.lastScrollTop > 0) {
        if (scrollTop > throttleHeight) {
          this.hide();
        }
        if (config.sidebar.enable) {
          //向下滚动取消侧边栏头部留空
          sidebar?.querySelector('.sidebar-content')?.classList.remove('headblank');
        }
      } else {
        this.show();
        if (config.sidebar.enable) {
          //向上滚动时若导航条覆盖侧边栏内容，则给侧边栏头部留空
          const sidebarTop = sidebar?.getBoundingClientRect().top ?? 0;
          const sidebarContentTop = sidebar?.querySelector('.sidebar-content')?.getBoundingClientRect().top ?? 0;
          if (sidebarTop < navbarHeight && sidebarContentTop >= 0) {
            sidebar?.querySelector('.sidebar-content')?.classList.add('headblank');
          } else {
            sidebar?.querySelector('.sidebar-content')?.classList.remove('headblank');
          }
        }
      }
    }
    this.lastScrollTop = scrollTop;
  }

  _bindScrollListener() {
    //添加滚动事件监听
    this.lastScrollTop = scrollManager.getScrollTop();
    scrollManager.register('nav', this._onScroll);
  }

  updateMenuIndicator() {
    // 初始化当前导航指示条
    this.rootElement?.querySelectorAll('.nav-menu-item>.link').forEach(link => {
      link.parentElement?.classList.remove('nav-active');
      if (link instanceof HTMLAnchorElement) {
        console.log(document.location.pathname.replace(/\/$/gi, ''),new URL(link.href, document.location.origin).pathname.replace(/\/$/gi, ''))
      }
      if (link instanceof HTMLAnchorElement && document.location.pathname.replace(/\/$/gi, '') == new URL(link.href, document.location.origin).pathname.replace(/\/$/gi, '')) {
        link.parentElement?.classList.add('nav-active');
      }
    });
  }

  initRightDrawer() {
    const rightDrawerTemplate = document.querySelector('#right-drawer-template');
    if (rightDrawerTemplate instanceof HTMLTemplateElement) {
      const el = rightDrawerTemplate.content.querySelector('.drawer')?.cloneNode(true);
      const toggle = document.querySelector('#right-drawer-toggle');
      if (el instanceof HTMLElement) {
        this.rightDrawerSideBarIns = new Sidebar(el);
        this.rightDrawerIns = new Drawer(el, toggle);
      }
    }
  }

  initLeftDropdown() {
    const leftDropdownTemplate = document.querySelector('#left-dropdown-template');
    if (leftDropdownTemplate instanceof HTMLTemplateElement) {
      const el = leftDropdownTemplate.content.querySelector('.cascade-dropdown')?.cloneNode(true);
      const toggle = document.querySelector('#left-dropdown-toggle');
      if (el instanceof HTMLElement) {
        this.leftDropdownIns = new CascadeDropdown(el, toggle, {
          trigger: 'hover',
          zIndex: 100,
        });
      }
    }
  }

  _initMenu() {
    // 初始化多级菜单
    if (this.menuElement) {
      const menuToggleList = [...this.menuElement.querySelectorAll('.menu-toggle')];
      menuToggleList.forEach(toggle => {
        const dropdownTemplate = toggle.nextElementSibling;
        if (dropdownTemplate instanceof HTMLTemplateElement) {
          const el = dropdownTemplate.content.querySelector('.cascade-dropdown')?.cloneNode(true);
          if (el instanceof HTMLElement) {
            this.menuInses.push(
              new CascadeDropdown(el, toggle, {
                trigger: 'hover',
                zIndex: 100,
              })
            );
          }
        }
      });
    }
  }

  _initTool() {
    if (config.navigator.toolkit.search.enable && config.search.enable) {
      this.searchIns = new Search();
    }
    this.initLeftDropdown();
    if(config.sidebar.enable) {
      this.initRightDrawer();
    }

    if (config.navigator.toolkit.colormode.enable) {
      // 初始化颜色模式按钮
      const colorModeToggle = document.querySelector('#color-mode-toggle');
      if (colorModeToggle instanceof HTMLElement) {
        const changeIcon = () => {
          if (colorMode.get() === 'auto') {
            return '<svg fill="currentColor" width="1em" height="1em"><use xlink:href="#ri-computer-line"></use></svg>';
          } else if (colorMode.get() === 'dark') {
            return '<svg fill="currentColor" width="1em" height="1em"><use xlink:href="#ri-moon-fill"></use></svg>';
          } else {
            return '<svg fill="currentColor" width="1em" height="1em"><use xlink:href="#ri-sun-fill"></use></svg>';
          }
        };
        colorModeToggle.innerHTML = changeIcon();
        const callback = event => {
          colorMode.toggle();
          const icon = changeIcon();
          colorModeToggle.innerHTML = icon;
          const modeText =
            colorMode.get() === 'auto' ? '跟随系统' : colorMode.get() === 'dark' ? '深色模式' : '浅色模式';
          Toastify({
            text: `${icon}<span class="ml-2 mr-1">已切换至${modeText}</span>`,
            duration: 1500,
            gravity: 'top',
            close: false,
            position: 'right',
            className:
              'bg-gradient-to-br from-primary-500 to-primary-700 rounded-md shadow-lg shadow-primary-900/50 dark:shadow-primary-700/50 flex flex-nowrap items-center text-base max-w-full',
            stopOnFocus: true,
            escapeMarkup: false,
            offset: {
              x: 0,
              y: 56,
            },
          }).showToast();
        };
        colorModeToggle.addEventListener('click', callback);
        this.colorModeBtnIns = {
          async destroy() {
            colorModeToggle.removeEventListener('click', callback);
          },
        };
      }
    }
  }

  isShown() {
    if (!this.rootElement) return false;
    return !this.rootElement.classList.contains('nav-hide');
  }

  show() {
    this.rootElement?.classList.remove('nav-hide');
    this.rootElement?.classList.add('nav-show');
  }

  hide() {
    this.rootElement?.classList.remove('nav-show');
    this.rootElement?.classList.add('nav-hide');

    this.menuInses.forEach(menu => {
      menu.closeAll();
    });
  }

  async reset(element = document.querySelector('#navigator')) {
    this.searchIns?.destroy();
    const waitList = [];
    waitList.push(
      this.rightDrawerIns?.destroy(),
      this.rightDrawerSideBarIns?.destroy(),
      this.leftDropdownIns?.destroy(),
      this.colorModeBtnIns?.destroy(),
      ...this.menuInses.map(menu => menu.destroy())
    );
    await Promise.all(waitList);

    this.rootElement = null;
    this.menuElement = null;
    this.logoElement = null;
    this.toolElement = null;
    this.menuInses = [];
    this.init(element);
  }

  async destroy() {
    scrollManager.unregister('nav');
    this.searchIns?.destroy();
    const waitList = [];
    waitList.push(
      this.rightDrawerIns?.destroy(),
      this.rightDrawerSideBarIns?.destroy(),
      this.leftDropdownIns?.destroy(),
      this.colorModeBtnIns?.destroy(),
      ...this.menuInses.map(menu => menu.destroy())
    );
    await Promise.all(waitList);
    this.rootElement = null;
    this.menuElement = null;
    this.logoElement = null;
    this.toolElement = null;
    this.menuInses = [];
  }
}

export default Navigator;
