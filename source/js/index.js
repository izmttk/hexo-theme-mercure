// 滚动事件拦截器
class ScrollManager {
    constructor(element = document) {
        this.store = {};
        this.element = element;
        this._handleScroll = this._handleScroll.bind(this);
        this.element.addEventListener('scroll', this._handleScroll);
    }
    register(name, fn) {
        if (!name) throw new TypeError('name is required');
        if (typeof fn !== 'function') throw new TypeError('fn must be a function');
        this.store[name] = fn;
    }
    unregister(name) {
        if (!name) throw new TypeError('name is required');
        Reflect.deleteProperty(this.store, name);
    }
    _handleScroll() {
        for (let handler in this.store) {
            Reflect.apply(this.store[handler], this, arguments);
        }
    }
    getScrollTop() {
        return this.element === document ? document.documentElement.scrollTop : this.element.scrollTop;
    }
    getScrollLeft() {
        return this.element === document ? document.documentElement.scrollLeft : this.element.scrollLeft;
    }
    scrollTo(xCoord, yCoord = 0) {
        window.scroll({
            top: xCoord,
            left: yCoord,
            behavior: 'smooth'
        });
    }
    triggerEvent() {
        this.element.dispatchEvent(new Event('scroll'));
    }
    destroy() {
        delete this.store;
        this.element.removeEventListener('scroll', this._handleScroll);
    }
}
const scrollManager = new ScrollManager();

// anchor 点击事件拦截器
class AnchorManager {
    constructor(element = document) {
        this.store = {};
        this.element = element;
        this._handleClick = this._handleClick.bind(this);
        this.mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    [...node.querySelectorAll('a[href]')].forEach(item => {
                        item.removeEventListener('click', this._handleClick, true);
                    });
                });
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    [...node.querySelectorAll('a[href]')].forEach(item => {
                        item.addEventListener('click', this._handleClick, true);
                    });
                });
            });
        });
        this.mutationObserver.observe(this.element, {childList: true, subtree: true});
    }
    // 监视搜索页面和弹窗中的链接
    _handleClick = function() {
        for (let handler in this.store) {
            Reflect.apply(this.store[handler], this, arguments);
        }
    }
    register(name, fn) {
        if (!name) throw new TypeError('name is required');
        if (typeof fn !== 'function') throw new TypeError('fn must be a function');
        this.store[name] = fn;
        [...this.element.querySelectorAll('a[href]')].forEach(item => {
            item.addEventListener('click', this._handleClick, true);
        });
    }
    unregister(name) {
        if (!name) throw new TypeError('name is required');
        [...this.element.querySelectorAll('a[href]')].forEach(item => {
            item.removeEventListener('click', this._handleClick, true);
        });
        Reflect.deleteProperty(this.store, name);
    }
    destroy() {
        delete this.store;
        this.mutationObserver.disconnect();
    }
}
const anchorManager = new AnchorManager();

const animateCSS = (element, animation, prefix = '') =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    let node = element;
    if(typeof element === 'string') {
        node = document.querySelector(element);
    }
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

class Toc {
    constructor(postElement, tocElement) {
        let post = postElement;
        let toc = tocElement;

        let observedTitle = [...post.querySelectorAll('h2,h3,h4,h5,h6')];
        this.tocItem = new Map();

        let tocItem = [...toc.querySelectorAll('.toc a[href]')];
        for (let index = 0; index < tocItem.length; index++) {
            const element = tocItem[index];
            let name = element.getAttribute('href').substr(1); // remove # characters
            name = decodeURI(name);
            if(name.length > 0) {
                this.tocItem.set(name, {
                    index: index,
                    element: element,
                });
            }
        }
        this._handleIntersect = this._handleIntersect.bind(this);
        this.tocObserver = new IntersectionObserver(this._handleIntersect, {
            threshold: 1,
        });
        observedTitle.forEach(item => {
            this.tocObserver.observe(item);
        });
        this.activedTocItem = new Set();
    }
    _activateTocItem(name) {
        name = decodeURI(name);
        let item = this.tocItem.get(name);
        if (item) {
            this.activedTocItem.add(item);
            this._clearActiveClass();
            this._setActiveClass();
        }
    }
    _deactivateTocItem(name) {
        name = decodeURI(name);
        let item = this.tocItem.get(name);
        if (item) {
            if (this.activedTocItem.size > 1) {
                this._clearActiveClass();
            }
            this.activedTocItem.delete(item);
            this._setActiveClass();
        }
    }
    _clearActiveClass() {
        this.tocItem.forEach(item => {
            item.element.classList.remove('toc-active');
        });
    }
    _setActiveClass() {
        let minIndexItem = null;
        this.activedTocItem.forEach(item => {
            if (minIndexItem === null) {
                minIndexItem = item;
            } else {
                minIndexItem = minIndexItem.index < item.index ? minIndexItem : item;
            }
        });
        if (minIndexItem !== null) {
            minIndexItem.element.classList.add('toc-active');
        }
    }
    _handleIntersect(entries, observer) {
        entries.forEach(entry => {
            let name = entry.target.id;
            if (entry.intersectionRatio == 1) {
                this._activateTocItem(name);
            } else {
                this._deactivateTocItem(name);
            }
        });
    }
    destroy() {
        this.tocObserver.disconnect();
        this.tocItem.clear();
        this.activedTocItem.clear();
    }
}

class Header {
    constructor() {
        this.init();
    }
    init() {
        this.rootElement = document.querySelector('#header');
        let scene = this.rootElement.querySelector('.parallax-background');
        if(scene !== null) {
            this.parallax = new Parallax(scene, {
                // selector: '.layer',
                relativeInput: true,
                // clipRelativeInput: true,
                hoverOnly: true,
                frictionX: 0.18,
                frictionY: 0.18,
                scalarX: 6,
                scalarY: 6,
                limitX: 50,
                limitY: 50,
            });
        }
        this.indicatorElement = this.rootElement.querySelector('.indicator');
        this._handleIndicatorClick = this._handleIndicatorClick.bind(this);
        this.indicatorElement?.addEventListener('click', this._handleIndicatorClick);

    }
    _handleIndicatorClick(event) {
        scrollManager.scrollTo(this.rootElement.offsetTop +this.rootElement.scrollHeight);
    }
    destroy() {
        this.parallax?.destroy();
        this.indicatorElement?.removeEventListener('click', this._handleIndicatorClick);
        delete this.rootElement;
        delete this.indicatorElement;
        delete this.parallax;
    }
}

class Sidebar {
    constructor(element) {
        this.rootElement = element ?? document.querySelector('#sidebar');
        this.tabElement = this.rootElement.querySelector('.tabs');
        this.tocWidgetElement = this.rootElement.querySelector('.toc');
        this._initTabs();
        this._initToc();
        this._initWidgets();
    }
    _initTabs() {
        if(this.tabElement !== null) {
            this.tabIns = new Tabs(this.tabElement);
        }
    }
    _initToc() {
        if(this.tocWidgetElement !== null) {
            this.tocWidgetIns = new Toc(
                document.querySelector('#main .post'),
                this.rootElement.querySelector('.toc')
            );
        }
    }
    _initWidgets() {
        this.categoryTreeWidget = new CategoryTreeWidget(this.rootElement.querySelector('.category-tree'));
    }
    destroy() {
        this.tabIns?.destroy();
        this.tocWidgetIns?.destroy();
        this.categoryTreeWidget?.destroy();
        delete this.rootElement;
        delete this.tabElement;
        delete this.tocWidgetElement;
    }
}

class Navbar {
    constructor() {
        this.rootElement = document.querySelector('.navigator');
        this.menuElement = this.rootElement.querySelector('.nav-menu');
        this.logoElement = this.rootElement.querySelector('.nav-logo');
        this.toolElement = this.rootElement.querySelector('.nav-toolkit');
        this.searchElement = this.toolElement.querySelector('.search-toggle');
        this.menuDrawerElement = this.rootElement.querySelector('.nav-left-drawer');
        this.sideDrawerElement = this.rootElement.querySelector('.nav-right-drawer');

        this._initMenu();
        this._initTool();
        this._bindScrollListener();
        this.updateMenuIndicator();
    }
    _bindScrollListener() {
        let self = this;
        //添加滚动事件监听
        let lastScrollTop = scrollManager.getScrollTop();
        scrollManager.register('nav', function(event) {
            let sidebar  = document.querySelector('#sidebar');
            let scrollTop = scrollManager.getScrollTop();

            if (scrollTop <= 30) {
                self.show();
                self.rootElement.classList.remove('nav-fix');
                self.rootElement.classList.add('nav-top');

                sidebar.querySelector('.tabs')?.classList.remove('headblank');
            }
            else {
                self.rootElement.classList.remove('nav-top');
                self.rootElement.classList.add('nav-fix');
                if (scrollTop - lastScrollTop > 0) {
                    self.hide();
                    //向上滚动取消侧边栏头部留空
                    sidebar.querySelector('.tabs')?.classList.remove('headblank');
                }
                else {
                    self.show();
                    //向下滚动时若导航条覆盖侧边栏内容，则给侧边栏头部留空
                    if (sidebar.getBoundingClientRect().top < self.rootElement.getBoundingClientRect().height) {
                        sidebar.querySelector('.tabs')?.classList.add('headblank');
                    }
                    else {
                        sidebar.querySelector('.tabs')?.classList.remove('headblank');
                    }
                }
            }
            lastScrollTop = scrollTop;
        });
    }
    updateMenuIndicator() {
        // 初始化当前导航指示条
        this.rootElement.querySelectorAll('.nav-menu-item>.link').forEach(link => {
            link.parentElement.classList.remove('nav-active');
            function pathname(url) {
                // 清空origin、search、hash和最后一个/
                url = url.replace(/^(\w+:)?\/\/([\w-]+\.)+[\w-]+/gi, '');
                url = url.replace(/\?.*/gi, '');
                url = url.replace(/#.*/gi, '');
                url = url.replace(/\/$/gi, '');
                return url;
            }
            if(pathname(window.location.href) == pathname(link.href)) {
                link.parentElement.classList.add('nav-active');
            }
        });
    }
    initSideDrawer() {
        this.sideDrawerElement = this.rootElement.querySelector('.nav-right-drawer');
        this.sideDrawerIns = new SideDrawer();
        this.sideDrawerElement.addEventListener('click', this._sideDrawerListener);
    }
    initMenuDrawer() {
        this.menuDrawerElement = this.rootElement.querySelector('.nav-left-drawer');
        this.menuDrawerIns = new MenuDrawer();
        this.menuDrawerElement.addEventListener('click', this._menuDrawerListener);
    }
    destorySideDrawer() {
        this.sideDrawerIns?.destroy();
        this.sideDrawerElement?.removeEventListener('click', this._sideDrawerListener);
        delete this.sideDrawerElement;
    }
    destoryMenuDrawer() {
        this.menuDrawerIns?.destroy();
        this.menuDrawerElement?.removeEventListener('click', this._menuDrawerListener);
        delete this.menuDrawerElement;
    }
    _initMenu() {
        // 初始化多级菜单
        let menuToggleList = Array.from(this.menuElement.querySelectorAll('.menu-toggle'));
        this.menuInsList = menuToggleList.map(element => {
            let isRootToggle = element.parentElement.classList.contains('nav-menu-item');
            if(!isRootToggle) {
                element.insertAdjacentHTML('beforeend','<i class="ri-arrow-right-s-fill"></i>');
            }
            element.nextElementSibling.style.display = 'block';
            return new Menu(element, element.nextElementSibling, {
                placement: isRootToggle ? 'bottom-start' : 'right-start',
                trigger: 'mouseenter focus',
                appendTo: isRootToggle ? () => this.rootElement : 'parent'
            });
        });
    }
    _initTool() {
        this.searchIns = new Search();
        this._searchListener = this._searchListener.bind(this);
        this._menuDrawerListener = this._menuDrawerListener.bind(this);
        this._sideDrawerListener = this._sideDrawerListener.bind(this);
        this.searchElement.addEventListener('click', this._searchListener);
        this.initMenuDrawer();
        this.initSideDrawer();
    }
    _searchListener (event) {
        this.searchIns.toggle();
    }
    _menuDrawerListener (event) {
        this.menuDrawerIns.toggle();
    }
    _sideDrawerListener (event) {
        this.sideDrawerIns.toggle();
    }
    isShown() {
        return !this.rootElement.classList.contains('nav-hide');
    }
    show() {
        this.rootElement.classList.remove('nav-hide');
        this.rootElement.classList.add('nav-show');
    }
    hide() {
        this.rootElement.classList.remove('nav-show');
        this.rootElement.classList.add('nav-hide');
    }
    destroy() {
        this.menuInsList.forEach(element => {
            element?.destroy();
        });
        this.searchIns?.destroy();
        this.searchElement?.removeEventListener('click', this._searchListener);
        scrollManager.unregister('nav');
        this.destoryMenuDrawer();
        this.destorySideDrawer();
        delete this.rootElement;
        delete this.menuElement;
        delete this.logoElement;
        delete this.toolElement;
        delete this.searchElement;
        this.urlMutationObserver.disconnect();
        delete this.urlMutationObserver;
    }
}

class CategoryTreeWidget {
    constructor(element) {
        this.rootElement = element ?? document.querySelector('.category-tree');
        // 初始化多级菜单
        let collapseElementList = Array.from(this.rootElement.querySelectorAll('.collapse'));
        this.collapseInsList = collapseElementList.map(element => {
            return new Collapse(element);
        });
        //替换叶子节点图标
        this.toggleList = Array.from(this.rootElement.querySelectorAll('.collapse-item'));
        this.toggleList.forEach(element => {
            let titleEl = element.querySelector('.collapse-item-title');
            titleEl.querySelector('.prefix')?.remove();
            if(element.querySelector('.collapse') !== null) {
                if(element.classList.contains('collapse-item-open')) {
                    titleEl.querySelector('.name').insertAdjacentHTML(
                        'beforebegin',
                        '<span class="prefix"><i class="ri-folder-open-fill"></i></span>'
                    );
                } else {
                    titleEl.querySelector('.name').insertAdjacentHTML(
                        'beforebegin',
                        '<span class="prefix"><i class="ri-folder-fill"></i></span>'
                    );
                }
            } else {
                titleEl.querySelector('.name').insertAdjacentHTML(
                    'beforebegin',
                    '<span class="prefix"><i class="ri-bookmark-fill"></i></span>'
                );
            }
        });
        this._initToggle();
    }
    _initToggle() {
        let self = this;
        this._toggleListener = function(...args) {
            Reflect.apply(self._handleUnfoldCategory, self, args);
        }
        this.toggleList.forEach(element => {
            element.addEventListener('collapse:open', this._toggleListener);
            element.addEventListener('collapse:close', this._toggleListener);
        });
    }
    _handleUnfoldCategory(event) {
        event.stopPropagation();
        let titleEl = event.target.querySelector('.collapse-item-title');
        titleEl.querySelector('.prefix')?.remove();
        if (event.type === 'collapse:open') {
            titleEl.querySelector('.name').insertAdjacentHTML(
                'beforebegin',
                '<span class="prefix"><i class="ri-folder-open-fill"></i></span>'
            );
        } else {
            titleEl.querySelector('.name').insertAdjacentHTML(
                'beforebegin',
                '<span class="prefix"><i class="ri-folder-fill"></i></span>'
            );
        }
    }
    destroy() {
        this.collapseInsList?.forEach(element => {
            element.destroy();
        });
        this.toggleList?.forEach(element => {
            element.removeEventListener('collapse:open', this._toggleListener);
            element.removeEventListener('collapse:close', this._toggleListener);
        });
        delete this.rootElement;
        delete this.collapseInsList;
        delete this.toggleList;
    }
}

class MenuDrawer extends Drawer {
    constructor() {
        let rootElement = document.querySelector('.nav-menu-drawer');
        super(rootElement, {
            position: 'left',
            width: 250
        });
        this.rootElement = rootElement;

        let menuToggleList = Array.from(this.rootElement.querySelectorAll('.collapse'));
        this.menuInsList = menuToggleList.map(element => {
            return new Collapse(element);
        });
    }
    destroy() {
        this.menuInsList?.forEach(element => {
            element.destroy();
        });
        super.destroy();
        delete this.rootElement;
        delete this.menuInsList;
    }
}

class SideDrawer extends Drawer {
    constructor() {
        let rootElement = document.querySelector('.nav-sidebar-drawer');

        super(rootElement, {
            position: 'right',
            width: 278
        });
        this.rootElement = rootElement;
        this.sidebarIns = new Sidebar(document.querySelector('#sidebar-drawer'));
        // this.drawerContainer = document.querySelector('#sidebar-drawer');
        // this.sidebarContainer = document.querySelector('#sidebar');
    }
    open() {
        // this.drawerContainer.appendChild(this.sidebarContainer.querySelector('.sidebar-content'));
        super.open();
    }
    close() {
        let self = this;
        // setTimeout(function(){
        //     self.sidebarContainer.appendChild(self.drawerContainer.querySelector('.sidebar-content'));
        // }, 350);
        super.close();
    }
    destroy() {
        super.destroy();
        this.sidebarIns?.destroy();
        delete this.rootElement;
        delete this.drawerContainer;
        delete this.sidebarContainer;
    }
}

class Search {
    constructor() {
        this.init();
    }
    init() {
        this.templateElement = document.querySelector('#site_search_template');
    }
    _handleSearch(event) {
        if(event.type === 'keydown' && event.key !== 'Enter') {
            return;
        }
        if (!this.searchApi.isKeywordsChanged()) return;
        this.rootElement.classList.add('searched');
        anime({
            targets: '#site_search .form-group',
            marginTop: '4rem',
            easing: 'easeOutCubic',
            duration: 300
        });
        this.searchApi.query();
    }
    isOpen() {
        return this.modalIns?.isOpen();
    }
    open() {
        if(!this.isOpen()) {
            let self = this;
            let context = this.templateElement.content.cloneNode(true);
            this.modalIns = new Modal(context);
            this.modalIns.open();

            this.searchApi = new LocalSearch('search-input', 'search-result-wrap');
            this.modalElement = document.querySelector('.modal-layout');
            this.rootElement = this.modalElement.querySelector('#site_search');
            this.inputElement = this.rootElement.querySelector('#search-input');
            this.buttonElement = this.rootElement.querySelector('#search-btn');

            // 改变焦点到输入框
            this.inputElement.focus();
            this._eventListener = function(...args) {
                Reflect.apply(self._handleSearch, self, args);
            }
            this.inputElement.addEventListener('keydown', this._eventListener);
            this.buttonElement.addEventListener('click', this._eventListener);
        }
    }
    close() {
        if(this.isOpen()) {
            this.inputElement.removeEventListener('keydown', this._eventListener);
            this.buttonElement.removeEventListener('click', this._eventListener);
            this.modalIns?.close();
            this.modalIns?.destroy();
            delete this.rootElement;
            delete this.modalIns;
            delete this.searchApi;
            delete this.modalElement;
            delete this.inputElement;
            delete this.buttonElement;
        }
    }
    toggle() {
        if(!this.isOpen()) {
            this.open();
        } else {
            this.close();
        }
    }
    destroy() {
        this.modalIns?.destroy();
        delete this.templateElement;
    }
}

class FloatToolbar {
    constructor() {
        this.rootElement = document.querySelector('.float-toolbar');
        this.backToTopBtn = document.querySelector('#back-to-top-btn');
        this.goToCommentBtn = document.querySelector('#go-to-comment-btn');
        let self = this;
        scrollManager.register('toolbar', function(...args) {
            Reflect.apply(self._handleFloatToolbar, self, args);
        });
        if(this.backToTopBtn !== null) {
            this._initBacktoTopBtn();
        }
        if(this.goToCommentBtn !== null) {
            this._initGotoCommentBtn();
        }
    }
    _handleFloatToolbar(event) {
        if(scrollManager.getScrollTop() > 20) {
            this.rootElement.classList.remove('float-toolbar-hidden');
        } else {
            this.rootElement.classList.add('float-toolbar-hidden');
        }
    }
    _initBacktoTopBtn() {
        tippy(this.backToTopBtn, {
            content: '回到顶部',
            animation: 'shift-away',
            hideOnClick: false,
            placement: 'left',
            touch: 'hold',
            appendTo: this.rootElement,
            arrow: false,
        });
        this._backToTop = function() {
            scrollManager.scrollTo(0);
        }
        this.backToTopBtn.addEventListener('click', this._backToTop);
    }
    _initGotoCommentBtn() {
        tippy(this.goToCommentBtn, {
            content: '评论区直达',
            animation: 'shift-away',
            hideOnClick: false,
            placement: 'left',
            touch: 'hold',
            appendTo: this.rootElement,
            arrow: false,
        });
        this._goToComment = function() {
            let commentEl = document.querySelector('.comments');
            scrollManager.scrollTo(commentEl.offsetTop - 64);
        }
        this.goToCommentBtn.addEventListener('click', this._goToComment);
    }
    destroy() {
        scrollManager.unregister('toolbar');
        this.backToTopBtn?.removeEventListener('click', this._backToTop);
        this.goToCommentBtn?.removeEventListener('click', this._goToComment);
        delete this.rootElement;
        delete this.backToTopBtn;
        delete this.goToCommentBtn;
    }
}

class Loading {
    constructor(element) {
        this.element = element ?? document.querySelector('.loading');
        NProgress.configure({ 
            trickleSpeed: 200,
            showSpinner: false
        });
    }
    show() {
        NProgress.start();
        this.element.style.display = 'block';
        this.element.style.visibility = 'visible';
        animateCSS(this.element, 'fade-in');

        // this.element.classList.add('fade-in');
    }
    hide() {
        NProgress.done();
        animateCSS(this.element, 'fade-out').then(() => {
            this.element.style.visibility = 'hidden';
        });
    }
}
// const loading = new Loading();


class Blog {
    constructor() {
        this.pjaxSelectors = [
            'title',
            'meta[name=description]',
            '#script_blog_config',
            '#header',
            '#content',
            '#sidebar',
            '.nav-menu-drawer',
            '.nav-sidebar-drawer',
            '.float-toolbar',
        ];
        this.initNavbar();
        this.initHeader();
        this.initSidebar();
        this.initLoading();
        this.initFloatToolbar();
        this.initLazyLoad();
        this.initSmoothScroll();
        this.initTooltip();
        this.initKatex();
        this.initPjax();
        scrollManager.triggerEvent();
    }
    initNavbar() {
        if(window.BLOG_CONFIG.navigator.enable) {
            this.navbar = new Navbar();
        }
    }
    initHeader() {
        if(window.BLOG_CONFIG.header.enable) {
            this.header = new Header();
        } else {
            document.querySelector('.navigator').classList.add('nav-noheader');
        }
    }
    initSidebar() {
        if(window.BLOG_CONFIG.sidebar.enable) {
            this.sidebar = new Sidebar();
        }
    }
    initFloatToolbar() {
        this.floatToolbar = new FloatToolbar();
    }
    initLoading() {
        this.loading = new Loading();
    }
    initSmoothScroll() {
        anchorManager.register('smoothscroll', function(event) {
            let marginTop = 76;
            let url = event.currentTarget;
            if(url.origin === window.location.origin 
                && url.pathname === window.location.pathname
                && url.hash !== window.location.hash) {
                event.preventDefault();
                let id = decodeURI(url.hash); //decodeURI(this.getAttribute('href'));
                let target = document.querySelector(id);
                if (target !== null) {
                    scrollManager.scrollTo(target.offsetTop - marginTop);
                }
            }
        });
    }
    initLazyLoad() {
        if(window.BLOG_CONFIG.lazyload.enable) {
            lazyload();
        }
    }
    initTooltip() {
        tippy('[data-tippy-content]',{
            animation: 'shift-away',
            hideOnClick: false,
            touch: 'hold',
        });
    }
    initKatex() {
        if(window.BLOG_CONFIG.katex.enable) {
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ]
            });
        }
    }
    initPjax() {
        if(!window.BLOG_CONFIG.pjax.enable) {
            return;
        }
        this.pjax = new Pjax({
            elements: '.pjax',
            selectors: this.pjaxSelectors,
            cacheBust: false,
        });
        let self = this;
        document.addEventListener("pjax:send", function() {
            self.loading.show();
            self.header?.destroy();
            self.navbar?.destoryMenuDrawer();
            self.navbar?.destorySideDrawer();
            self.sidebar?.destroy();
            self.floatToolbar?.destroy();
            window.loadComments = null;
        });
        document.addEventListener("pjax:success", function() {
            self.initHeader();
            self.navbar?.searchIns.close();
            self.navbar?.initMenuDrawer();
            self.navbar?.initSideDrawer();
            self.navbar?.updateMenuIndicator();
            self.initSidebar();
            // self.anchorSmoothScroll();
            self.initFloatToolbar();
            self.initLazyLoad();
            self.initTooltip();
            self.initKatex();
            scrollManager.triggerEvent();
            animateCSS('#header','slide-down-fade-in');
            animateCSS('#main','slide-up-fade-in');
            self.loading.hide();
        });
        // 监视搜索页面和弹窗中的链接
        anchorManager.register('pjax', function(event) {
            let url = event.currentTarget;
            // 若网站只有hash部分改变，则不跳转
            if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
                event.preventDefault();
                self.pjax.loadUrl(url.href);
            }
        });
    }
}
const blog = new Blog();

function initDarkTheme() {
    function getOsPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function setDarkTheme() {
        localStorage.setItem('theme','dark');
        localStorage.setItem('osPreference', getOsPreference());
        document.querySelector('.dark-theme-toggle').innerHTML='<i class="ri-sun-fill"></i>';
        document.documentElement.classList.add('dark')
    }
    function setLightTheme() {
        localStorage.removeItem('theme');
        localStorage.setItem('osPreference', getOsPreference());
        document.querySelector('.dark-theme-toggle').innerHTML='<i class="ri-moon-fill"></i>';
        document.documentElement.classList.remove('dark')
    }
    //维持用户的选择直到下一次OsPreference切换
    if(localStorage.getItem('osPreference') == getOsPreference()) {
        if (localStorage.getItem('theme') === 'dark') {
            setDarkTheme();
        } else {
            setLightTheme();
        }
    } else {
        if(getOsPreference() === 'dark') {
            setDarkTheme();
        } else {
            setLightTheme();
        }
    }
    document.querySelector('.dark-theme-toggle').addEventListener("click", function() {
        if(document.documentElement.classList.contains('dark')) {
            setLightTheme();
        } else {
            setDarkTheme();
        }
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        if (e.matches) {
            setDarkTheme();
        } else {
            setLightTheme();
        }
    });
}

initDarkTheme();
