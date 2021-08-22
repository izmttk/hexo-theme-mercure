class ScrollManager {
    constructor(element = document) {
        let self = this;
        this.store = {};
        this.element = element;
        this._listenerCallback = function(...args) {
            self._handleScroll(this, args);
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
        this.indicatorElement.removeEventListener('click', this._indicatorListener);
    }
}

class Sidebar {
    constructor(element) {
        this.rootElement = element ?? document.querySelector('#sidebar');
        this.tabElement = this.rootElement.querySelector('.tabs');
        this.tocWidgetElement = this.rootElement.querySelector('.toc');
        if(this.tabElement !== null) {
            this.tabIns = new Tabs(this.tabElement);
        }
        if(this.tocWidgetElement !== null) {
            this.tocWidgetIns = new Toc(this.tocWidgetElement);
        }
        this._initWidgets();
    }
    _initWidgets() {
        this.categoryTreeWidget = new CategoryTreeWidget();
    }
    destroy() {
        this?.tabIns.destroy();
        this?.tocWidgetIns.destroy();
        this.categoryTreeWidget.destroy();
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
    }
    _bindScrollListener() {
        let self = this;
        let sidebar  = document.querySelector('#sidebar');
        //添加滚动事件监听
        let lastScrollTop = scrollManager.getScrollTop();
        scrollManager.register('nav', function(event) {
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
        scrollManager.triggerEvent();
    }
    _initMenu() {
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
        // 初始化多级菜单
        let menuToggleList = Array.from(this.menuElement.querySelectorAll('.menu-toggle'));
        this.menuInsList = menuToggleList.map(element => {
            let isRootToggle = element.parentElement.classList.contains('nav-menu-item');
            if(!isRootToggle) {
                element.insertAdjacentHTML('beforeend','<i class="ri-arrow-right-s-fill"></i>');
            }
            element.nextElementSibling.style.display = 'block';
            return new Menu(element, element.nextElementSibling, {
                arrow: false,
                position: isRootToggle ? 'bottom-start' : 'right-start',
                trigger: 'hover',
                appendTo: isRootToggle ? () => this.rootElement : 'parent',
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
            element.destroy();
        });
        this.searchIns.destroy();
        this.menuDrawerIns.destroy();
        this.sideDrawerIns.destroy();
        this.searchElement.removeEventListener('click', this._searchListener);
        this.menuDrawerElement.removeEventListener('click', this._menuDrawerListener);
        this.sideDrawerElement.removeEventListener('click', this._sideDrawerListener);
        scrollManager.unregister('nav');
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
        this.collapseInsList.forEach(element => {
            element.destroy();
        });
        this.toggleList.forEach(element => {
            element.removeEventListener('collapse:open', this._toggleListener);
            element.removeEventListener('collapse:close', this._toggleListener);
        });
    }
}

class MenuDrawer extends Drawer {
    constructor() {
        let rootElement = document.querySelector('.nav-menu-drawer');
        super(rootElement, {
            position: 'left',
            width: 272
        });
        this.rootElement = rootElement;

        let menuToggleList = Array.from(this.rootElement.querySelectorAll('.collapse'));
        this.menuInsList = menuToggleList.map(element => {
            return new Collapse(element);
        });
    }
    destroy() {
        this.menuInsList.forEach(element => {
            element.destroy();
        });
        super.destroy();
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
        this.drawerContainer = document.querySelector('#sidebar-drawer');
        this.sidebarContainer = document.querySelector('#sidebar');
    }
    open() {
        this.drawerContainer.appendChild(this.sidebarContainer.querySelector('.sidebar-content'));
        super.open();
    }
    close() {
        this.sidebarContainer.appendChild(this.drawerContainer.querySelector('.sidebar-content'));
        super.close();
    }
    destroy() {
        super.destroy();
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
        this.modalIns = null;
        this.searchApi = null;
        this.modalElement = null;
        this.inputElement = null;
        this.buttonElement = null;
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
    }
}

class BlogUiManager {
    DEFAULT_OPTIONS = {

    }
    constructor(options) {
        this.options = Object.assign(this.DEFAULT_OPTIONS, options);
        this.navbar = new Navbar();
        this.header = new Header();
        this.sidebar = new Sidebar();
        let self = this;
    }
}
const blogUiManager = new BlogUiManager();


function initNavbar() {
    var $navbar = $('.navigator');
    if(!window.blog.header) {
        $navbar.addClass('nav-noheader');
    }
}
//初始化导航栏音乐播放器
function initNavMusicPlayer() {
    var musicPlayerTooltip = tippy(document.querySelector('.music-player-toggle'), {
        content: 'test',//document.querySelector('.music-player'),
        theme: 'light-border',
        animation: 'shift-away',
        trigger: 'click',
        interactive: true,
        interactiveDebounce: 50,
        placement: 'bottom-end',
        arrow: true,
        // hideOnClick: false,
        role: 'menu',
        popperOptions: {
            modifiers: [
                {
                    name: 'flip',
                    options: {
                        boundary: 'viewport',
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: 'viewport'
                    },
                },
            ],
        },
    });
    // $('.nav-toolkit .music-player-toggle').on('click', function () {
        
    // });
}
function anchorSmoothScroll() {
    var marginTop = 76;
    $('.post a,.page a,.toc a').filter(function () {
        return /^#[^\s]*/g.test($(this).attr('href'));
    }).on('click', function (event) {
        event.preventDefault();
        var id = decodeURI($(this).attr('href'));
        var $target = $(id);
        $('html,body').animate({
            scrollTop: $target.offset().top - marginTop
        }, 400);
    });
}

initNavbar();
initNavMusicPlayer();
anchorSmoothScroll();

function initPostCover() {
    if(window.blog.post_card.cover.background === 'none') return;
    if(document.documentElement.clientWidth <= 768) return;
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
                console.log(111)
                this.setAttribute('src', this.getAttribute('data-error-src'));
            });
        // }
    });
}
initPostCover();

function initLazyLoad() {
    if(window.blog.lazyload) {
        lazyload();
    }
}
initLazyLoad();
function initDarkTheme() {
    if(!window.blog.darkmode) return;
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

function initTooltip() {
    tippy('[data-tippy-content]',{
        animation: 'shift-away',
        hideOnClick: false,
        touch: 'hold',
    });
}
initTooltip();

function initFloatToolbar() {
    var commentsEl = document.querySelector('.comments');
    var floatToolbarEl = document.querySelector('.float-toolbar');
    document.addEventListener('scroll', function(event) {
        if(this.documentElement.scrollTop > 20) {
            floatToolbarEl.classList.remove('float-toolbar-hidden');
        } else {
            floatToolbarEl.classList.add('float-toolbar-hidden');
        }
    });
    document.dispatchEvent(new Event('scroll'));
    var backToTopBtnEl =  document.querySelector('#back-to-top-btn')
    var goToCommentBtnEl =  document.querySelector('#go-to-comment-btn');
    if(backToTopBtnEl !== null) {
        tippy(backToTopBtnEl, {
            content: '回到顶部',
            animation: 'shift-away',
            hideOnClick: false,
            placement: 'left',
            touch: 'hold',
            appendTo: floatToolbarEl,
            arrow: false,
        });
        backToTopBtnEl.addEventListener('click', function(event) {
            anime({
                targets: document.documentElement,
                scrollTop: 0,
                easing: 'easeOutCubic',
                duration: 1000,
            });
        });
    }
    if(goToCommentBtnEl !== null) {
        tippy(goToCommentBtnEl, {
            content: '评论区直达',
            animation: 'shift-away',
            hideOnClick: false,
            placement: 'left',
            touch: 'hold',
            appendTo: floatToolbarEl,
            arrow: false,
        });
        goToCommentBtnEl.addEventListener('click', function(event) {
            anime({
                targets: document.documentElement,
                scrollTop: commentsEl.offsetTop - 64,
                easing: 'easeOutCubic',
                duration: 1000,
            });
        });
    }
}
initFloatToolbar();


// var pjax = new Pjax({
//     selectors: [
//         'title',
//         'meta[name=description]',
//         '#header',
//         '#content',
//         '#sidebar',
//     ]
// });
// document.addEventListener("pjax:success", function() {
//     initNavbar();
//     initCategoryTree();
//     initSidebarToc();
//     initSidebarTabs();
//     anchorSmoothScroll();
//     intiHeader();
//     initPostCover();
//     initLazyLoad();
//     initTooltip();
//     initFloatToolbar();
// })


