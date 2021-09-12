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

class Navbar {
    constructor() {
        this.rootElement = document.querySelector('.navigator');
        this.logoElement = this.rootElement.querySelector('.nav-logo');
        this.toolElement = this.rootElement.querySelector('.nav-toolkit');
        this.searchElement = this.toolElement.querySelector('.search-toggle');

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
    _initTool() {
        this.search = new Search();
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
        this.search?.destroy();
        scrollManager.unregister('nav');

        delete this.rootElement;
        delete this.logoElement;
        delete this.toolElement;
        delete this.searchElement;
    }
}

class Sidebar {
    constructor(element) {
        this.widgets = [];
        this._initWidgets();
    }
    _initWidgets() {
        if(window.BLOG_CONFIG.layout === 'post') {
            let toc1 = document.querySelector('#sidebar .toc');
            if (toc1 !== null) {
                this.widgets.push(new Toc(
                    document.querySelector('#main .post'),
                    document.querySelector('#sidebar .toc')
                ));
            }
            let toc2 = document.querySelector('#sidebar-drawer .toc');
            if (toc2 !== null) {
                this.widgets.push(new Toc(
                    document.querySelector('#main .post'),
                    document.querySelector('#sidebar-drawer .toc')
                ));
            }
        }
    }
    destroy() {
        this.widgets.forEach(w => w.destroy());
        delete this.widgets;
    }
}


class Search {
    constructor() {
        let self = this;
        this.searchApi = new LocalSearch('search-input', 'search-result-wrap');
        this.rootElement = document.querySelector('#site_search');
        this.inputElement = this.rootElement.querySelector('#search-input');
        this.buttonElement = this.rootElement.querySelector('#search-btn');
        // 改变焦点到输入框
        this.inputElement.focus();
        this._eventListener = function(...args) {
            Reflect.apply(self._handleSearch, self, args);
        }
        this.inputElement.addEventListener('input', this._eventListener);
        this.buttonElement.addEventListener('click', this._eventListener);
    }
    _handleSearch(event) {
        // if(event.type === 'keydown' && event.key !== 'Enter') {
        //     return;
        // }
        // if (!this.searchApi.isKeywordsChanged()) return;
        if (this.searchApi.isEmpty()) {
            this.rootElement.querySelector('#search-result')?.remove();
            this.rootElement.classList.remove('searched');
            return;
        }
        this.rootElement.classList.add('searched');
        this.searchApi.query();
    }
    destroy() {
        this.inputElement.removeEventListener('input', this._eventListener);
        this.buttonElement.removeEventListener('click', this._eventListener);
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
        animateCSS(this.element, 'fade-in');

        // this.element.classList.add('fade-in');
    }
    hide() {
        NProgress.done();
        animateCSS(this.element, 'fade-out').then(() => {
            this.element.style.display = 'none';
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
            '#sidebar-drawer',
            '.float-toolbar',
        ];
        this.initNavbar();
        this.initHeader();
        this.initSidebar();
        this.initLoading();
        this.initFloatToolbar();
        // this.initMaterialPostCover();
        this.initLazyLoad();
        this.anchorSmoothScroll();
        this.initTooltip();
        this.initKatex();
        // this.initComments();
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
    // initMaterialPostCover() {
    //     if(window.BLOG_CONFIG.post_card.cover.type === 'material'
    //         && window.BLOG_CONFIG.post_card.cover.background === 'auto') {
    //         document.querySelectorAll('.post-item.material-cover').forEach(function(item) {
    //             function setPostBgColor(img) {
    //                 Vibrant.from(img, {
    //                     quality: 5
    //                 }).getPalette().then(function(swatches) {
    //                     if(swatches.DarkVibrant.getPopulation() < swatches.LightVibrant.getPopulation()) {
    //                         item.querySelector('.background').style.backgroundColor = swatches.LightVibrant.getHex();
    //                         item.querySelector('.post-info').style.color = swatches.DarkVibrant.getHex();
    //                     } else {
    //                         item.querySelector('.background').style.backgroundColor = swatches.DarkVibrant.getHex();
    //                         item.querySelector('.post-info').style.color = swatches.LightVibrant.getHex();
    //                     }
    //                 });
    //             }
    //             var imgEl = item.querySelector('.cover-img');
    //             // if(imgEl.complete) {
    //                 // setPostBgColor(imgEl)
    //             // } else {
    //                 imgEl.addEventListener('load', function() {
    //                     var that = this;
    //                     setPostBgColor(that);
    //                 });
    //                 imgEl.addEventListener('error', function() {
    //                     this.setAttribute('src', this.getAttribute('data-error-src'));
    //                 });
    //             // }
    //         });
    //     }
    // }
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
            selectors: this.pjaxSelectors,
            cacheBust: false,
        });
        let self = this;
        let toBeClosedElementName = [
            'app-drawer',
            'app-modal',
            'app-collapse',
            'app-popover',
        ]
        document.addEventListener("pjax:send", function() {
            self.loading.show();
            self.header?.destroy();
            self.sidebar?.destroy();
            self.floatToolbar?.destroy();
            window.loadComments = null;



        });
        document.addEventListener("pjax:success", function() {
            self.navbar?.updateMenuIndicator();
            self.initHeader();
            self.initSidebar();
            self.anchorSmoothScroll();
            // self.initMaterialPostCover();
            self.initFloatToolbar();
            self.initLazyLoad();
            self.initTooltip();
            self.initKatex();
            // self.initComments();
            scrollManager.triggerEvent();
            animateCSS('#header','slide-down-fade-in');
            animateCSS('#main','slide-up-fade-in');
            self.loading.hide();
            document.querySelectorAll(toBeClosedElementName.join(',')).forEach(item => {
                item.open = false;
            });
        });
        document.querySelectorAll('app-list-item').forEach(item => {
            let a = item.shadowRoot.querySelector('a');
            a?.addEventListener('click', e => {
                e.preventDefault();
                self.pjax.loadUrl(a.href);
            });
        });
        this._handlePjaxLoad = function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.pjax.loadUrl(e.currentTarget.href);
        }
        this.pjaxMutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    [...node.querySelectorAll('a[href]')].forEach(item => {
                        item.addEventListener('click', this._handlePjaxLoad, true);
                    });
                });
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    [...node?.querySelectorAll('a[href]')].forEach(item => {
                        item.removeEventListener('click', this._handlePjaxLoad, true);
                    });
                });
            });
        });
        this.pjaxMutationObserver.observe(document.documentElement, {childList: true, subtree: true});
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
