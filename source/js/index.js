class ScrollManager {
    constructor(element = document) {
        let self = this;
        this.store = {};
        this.element = element;
        this._listenerCallback = function(...args) {
            self._handleScroll(self, args);
        }
        this.element.addEventListener('scroll', this._listenerCallback);
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
    _handleScroll(ctx, args) {
        for (let handler in this.store) {
            Reflect.apply(this.store[handler], ctx, args);
        }
    }
    getScrollTop() {
        return this.element === document ? document.documentElement.scrollTop : this.element.scrollTop;
    }
    getScrollLeft() {
        return this.element === document ? document.documentElement.scrollLeft : this.element.scrollLeft;
    }
    scrollTo(xCoord, yCoord = 0, duration = 1000) {
        anime({
            targets: this.element === document ? document.documentElement : this.element,
            scrollTop: xCoord,
            scrollLeft: yCoord,
            easing: 'easeOutCubic',
            duration: duration,
        });
    }
    triggerEvent() {
        this.element.dispatchEvent(new Event('scroll'));
    }
    destroy() {
        this.element.removeEventListener('scroll', this._listenerCallback);
    }
}
const scrollManager = new ScrollManager();

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
        let self = this;
        this._indicatorListener = function(...args) {
            Reflect.apply(self._handleIndicatorClick, self, args);
        }
        this.indicatorElement?.addEventListener('click', this._indicatorListener);

    }
    _handleIndicatorClick(event) {
        scrollManager.scrollTo(this.rootElement.offsetTop +this.rootElement.scrollHeight);
    }
    destroy() {
        this.parallax?.destroy();
        this.indicatorElement?.removeEventListener('click', this._indicatorListener);
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
            this.tocWidgetIns = new Toc(this.tocWidgetElement);
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
                appendTo: isRootToggle ? () => this.rootElement : 'parent',
                onCreate(instance) {
                    if(window.BLOG_CONFIG.pjax.enable === true) {
                        instance.popper.querySelectorAll('a[href]')?.forEach(element => {
                            let url = element.getAttribute('href');
                            if(url === 'javascript:void(0)') return;
                            element.addEventListener('click', function(event) {
                                event.preventDefault();
                                new Pjax({
                                    selectors: [
                                        'title',
                                        'meta[name=description]',
                                        '#script_blog_config',
                                        '#header',
                                        '#content',
                                        '#sidebar',
                                        '.nav-sidebar-drawer',
                                        '.float-toolbar'
                                    ],
                                    cacheBust: false,
                                }).loadUrl(url);
                            });  
                        });
                    }
                }
            });
        });
    }
    _initTool() {
        this.searchIns = new Search();
        this.menuDrawerIns = new MenuDrawer();
        this.sideDrawerIns = new SideDrawer();

        let self = this;

        this._searchListener = function(event) {
            self.searchIns.toggle();
        }
        this._menuDrawerListener = function(event) {
            self.menuDrawerIns.toggle();
        }
        this._sideDrawerListener = function(event) {
            self.sideDrawerIns.toggle();
        }
        this.searchElement.addEventListener('click', this._searchListener);
        this.menuDrawerElement.addEventListener('click', this._menuDrawerListener);
        this.sideDrawerElement.addEventListener('click', this._sideDrawerListener);

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
        this.menuDrawerIns?.destroy();
        this.sideDrawerIns?.destroy();
        this.searchElement?.removeEventListener('click', this._searchListener);
        this.menuDrawerElement?.removeEventListener('click', this._menuDrawerListener);
        this.sideDrawerElement?.removeEventListener('click', this._sideDrawerListener);
        scrollManager.unregister('nav');

        delete this.rootElement;
        delete this.menuElement;
        delete this.logoElement;
        delete this.toolElement;
        delete this.searchElement;
        delete this.menuDrawerElement;
        delete this.sideDrawerElement;
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
            duration: 500
        });
        this.searchApi.query();
    }
    isOpen() {
        return this.modalIns?.isOpen();
    }
    open() {
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
    close() {
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
    }
    show() {
        this.element.style.display = 'block';
        animateCSS(this.element, 'fade-in');
        // this.element.classList.add('fade-in');
    }
    hide() {
        animateCSS(this.element, 'fade-out').then(() => {
            this.element.style.display = 'none';
        });

        // this.element.classList.add('fade-out');
        // setTimeout(() => {
        //     this.element.style.display = 'none';
        // }, 500);
    }
}
const loading = new Loading();


class BlogUiManager {
    DEFAULT_OPTIONS = {

    }
    constructor(options) {
        this.options = Object.assign(this.DEFAULT_OPTIONS, options);
        this.initNavbar();
        this.initHeader();
        this.initSidebar();
        this.initFloatToolbar();
        this.initMaterialPostCover();
        this.initLazyLoad();
        this.anchorSmoothScroll();
        this.initTooltip();
        this.initKatex();
        this.initComments();
        this.initPjax();
        scrollManager.triggerEvent();
        topbar?.hide();
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
    anchorSmoothScroll() {
        let marginTop = 76;
        document.querySelectorAll('.post a, .page a, .toc a').forEach(element => {
            if(!/^#[^\s]*/g.test(element.getAttribute('href'))) {
                return;
            }
            element.addEventListener('click', function(event) {
                event.preventDefault();
                let id = decodeURI(this.getAttribute('href'));
                let target = document.querySelector(id);
                scrollManager.scrollTo(target.offsetTop - marginTop);
            })
        });
    }
    initMaterialPostCover() {
        if(window.BLOG_CONFIG.post_card.cover.type === 'material'
            && window.BLOG_CONFIG.post_card.cover.background === 'auto') {
            document.querySelectorAll('.post-item.material-cover').forEach(function(item) {
                function setPostBgColor(img) {
                    Vibrant.from(img, {
                        quality: 5
                    }).getPalette().then(function(swatches) {
                        if(swatches.DarkVibrant.getPopulation() < swatches.LightVibrant.getPopulation()) {
                            item.querySelector('.background').style.backgroundColor = swatches.LightVibrant.getHex();
                            item.querySelector('.post-info').style.color = swatches.DarkVibrant.getHex();
                        } else {
                            item.querySelector('.background').style.backgroundColor = swatches.DarkVibrant.getHex();
                            item.querySelector('.post-info').style.color = swatches.LightVibrant.getHex();
                        }
                    });
                }
                var imgEl = item.querySelector('.cover-img');
                // if(imgEl.complete) {
                    // setPostBgColor(imgEl)
                // } else {
                    imgEl.addEventListener('load', function() {
                        var that = this;
                        setPostBgColor(that);
                    });
                    imgEl.addEventListener('error', function() {
                        this.setAttribute('src', this.getAttribute('data-error-src'));
                    });
                // }
            });
        }
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
    initComments() {
        // if(typeof window.loadComments === 'function') {
        //     window.loadComments();
        // }
    }
    initPjax() {
        if(!window.BLOG_CONFIG.pjax.enable) {
            return;
        }
        this.pjax = new Pjax({
            selectors: [
                'title',
                'meta[name=description]',
                '#script_blog_config',
                '#header',
                '#content',
                '#sidebar',
                '.nav-sidebar-drawer',
                '.float-toolbar'
            ],
            cacheBust: false,
        });
        let self = this;
        topbar.config({
            barColors: {
                0: 'rgb(71,154,248)'
            },
        });
        document.addEventListener("pjax:send", function() {
            topbar?.show();
            loading?.show();
            // self.navbar?.destroy();
            self.header?.destroy();
            self.sidebar?.destroy();
            self.floatToolbar?.destroy();
            self.navbar?.sideDrawerIns?.destroy();

            window.loadComments = null;
        });
        document.addEventListener("pjax:success", function() {
            self.navbar?.updateMenuIndicator();
            if(self.navbar?.sideDrawerIns) {
                self.navbar.sideDrawerIns = new SideDrawer();
            }
            // self.initNavbar();
            self.initHeader();
            self.initSidebar();
            self.anchorSmoothScroll();
            self.initMaterialPostCover();
            self.initFloatToolbar();
            self.initLazyLoad();
            self.initTooltip();
            self.initKatex();
            self.initComments();
            scrollManager.triggerEvent();
            animateCSS('#header','slide-down-fade-in');
            animateCSS('#main','slide-up-fade-in');
            topbar?.hide();
            loading?.hide();
        })
    }
}
const blogUiManager = new BlogUiManager();


// //初始化导航栏音乐播放器
// function initNavMusicPlayer() {
//     var musicPlayerTooltip = tippy(document.querySelector('.music-player-toggle'), {
//         content: 'test',//document.querySelector('.music-player'),
//         theme: 'light-border',
//         animation: 'shift-away',
//         trigger: 'click',
//         interactive: true,
//         interactiveDebounce: 50,
//         placement: 'bottom-end',
//         arrow: true,
//         // hideOnClick: false,
//         role: 'menu',
//         popperOptions: {
//             modifiers: [
//                 {
//                     name: 'flip',
//                     options: {
//                         boundary: 'viewport',
//                     },
//                 },
//                 {
//                     name: 'preventOverflow',
//                     options: {
//                         boundary: 'viewport'
//                     },
//                 },
//             ],
//         },
//     });
//     // $('.nav-toolkit .music-player-toggle').on('click', function () {
        
//     // });
// }

// initNavMusicPlayer();

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
}
initDarkTheme();
