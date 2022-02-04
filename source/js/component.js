$.extend({
    //消抖
    debounce: function (fn, timeout, invokeAsap, ctx) {
        if (arguments.length == 3 && typeof invokeAsap != 'boolean') {
            ctx = invokeAsap;
            invokeAsap = false;
        }
        var timer;
        return function () {
            var args = arguments;
            ctx = ctx || this;
            invokeAsap && !timer && fn.apply(ctx, args);
            clearTimeout(timer);
            timer = setTimeout(function () {
                invokeAsap || fn.apply(ctx, args);
                timer = null;
            }, timeout);
        };
    },
    //节流
    throttle: function (fn, timeout, ctx) {
        var timer, args, needInvoke;
        return function () {
            args = arguments;
            needInvoke = true;
            ctx = ctx || this;
            timer || (function () {
                if (needInvoke) {
                    fn.apply(ctx, args);
                    needInvoke = false;
                    timer = setTimeout(arguments.callee, timeout);
                } else {
                    timer = null;
                }
            })();
        };
    }
});
//可折叠面板
class Collapse {
    constructor (selector, options = {}) {
        var that = this;
        this.element = $(selector).first();
        this.items = this.element.children('.collapse-item');
        options = Object.assign({}, options);
        this.bindEvents();
        this.items.each(function () {
            if (that.isOpen(this)) that.open(this, 0);
            else that.close(this, 0);
        });
    }
    bindEvents () {
        var that = this;
        this.items.children('.collapse-item-title').on('click', function (event) {
            if ($(event.target).is('a')) return;
            var $title = $(this);
            var $item = that.getItem($title.parent());
            that.toggle($item, 200);
        });
    }
    getItem (item) {
        if (typeof item === 'number') return this.items.eq(item);
        var $item = $(item).first();
        if (!$item.parent().is(this.element)) {
            throw new Error('Item is not the children of Collapse element');
        }
        return $item;
    }
    isOpen (item) {
        var $item = this.getItem(item);
        return $item.hasClass('collapse-item-open');
    }
    open (item, duration = 200) {
        var $item = this.getItem(item);
        var $content = $item.children('.collapse-item-content');
        if (!$content.length) return;
        $content.stop();
        $item.addClass('collapse-item-open');
        $item.get(0).dispatchEvent(new CustomEvent('collapse:open'));
        var contentHeight = $content[0].scrollHeight;
        $content.animate({ height: contentHeight }, duration, function () {
            $content.css({ height: 'auto', overflow: 'auto' })
        });
    }
    close (item, duration = 200) {
        var $item = this.getItem(item);
        var $content = $item.children('.collapse-item-content');
        if (!$content.length) return;
        $content.stop();
        $item.removeClass('collapse-item-open');
        $item.get(0).dispatchEvent(new CustomEvent('collapse:close'));
        $content.css({ overflow: 'hidden' });
        $content.animate({ height: 0 }, duration);
    }
    toggle (item, duration = 200) {
        if (this.isOpen(item)) this.close(item, duration);
        else this.open(item, duration);
    }
    destroy() {
        this.items.children('.collapse-item-title').off('click');
    }
}
//菜单
class Menu {
    DEFAULT_OPTIONS = {
        placement: 'bottom-start',
        arrow: false,
        animation: 'shift-away',
        theme: 'light-border',
        trigger: 'click',
        appendTo: () => document.body,
        interactive: true,
        interactiveDebounce: 50,
        // hideOnClick: false,
        offset: [-6, -6],
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
    }
    constructor (toggle, content, options = {}) {
        options = Object.assign(this.DEFAULT_OPTIONS, options);
        this.instance = tippy($(toggle).get(0), {
            content: $(content).get(0),
            ...options,
        });
    }
    open () {
        this.instance.show();
    }
    close () {
        this.instance.hide();
    }
    toggle () {
        if(this.instance.state.isShown)
        this.close();
        else this.open();
    }
    destroy() {
        this.instance.destroy();
    }
}

//标签页
class Tabs {
    constructor (selector, options = {}) {
        this.element = $(selector).first();
        this.tabs = this.element.children('.tabs-header').children('.tab');
        this.panels = this.element.children('.tabs-content').children('.tab-panel');
        this.panels.hide();
        //默认标签
        var $activeTab = this.getActiveTab();
        this.getPanel($activeTab).show();
        this.initGliderPos();
        this.bindEvents();
    }
    initGliderPos () {
        //初始化滑块位置
        var $glider = this.element.find('.glider');
        // $glider.height(this.tabs.outerHeight());
        // $glider.width($activeTab.outerWidth());
        $glider.height(28);
        $glider.width(116);
        // var tabOffsetLeft = $($activeTab).offset().left - this.tabs.offset().left;
        var tabOffsetLeft = 116 * this.getTabIndex(this.getActiveTab());
        // console.log(tabOffsetLeft)
        $glider.css('transform', 'translateX(' + tabOffsetLeft + 'px)');
    }
    bindEvents () {
        var that = this;
        this.tabs.on('click', function (event) {
            event.preventDefault();
            that.switch(this);

            var $glider = that.element.find('.glider');
            var tabOffsetLeft = $(this).offset().left - that.tabs.offset().left;
            var tabWidth = $(this).outerWidth();
            anime({
                targets: $glider.get(0),
                translateX: tabOffsetLeft,
                width: tabWidth,
                duration: 300,
                easing: 'easeOutCubic',
            });
        });
    }
    switch (tab) {
        var $tab = this.getTab(tab);
        var $panel = this.getPanel(tab);
        var $activePanel = this.getPanel(this.getActiveTab());

        if ($activePanel.is($panel)) return;

        //判断面板滑动方向
        var slideLeft = false;
        if ($activePanel.prevAll().filter($panel).length) slideLeft = false;
        else slideLeft = true;

        //旧面板消失
        anime.remove($activePanel.get(0));
        anime({
            targets: $activePanel.get(0),
            translateX: slideLeft ? [0, '-100%'] : [0, '100%'],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeOutCubic',
        }).finished.then(function () {
            $activePanel.hide();
        });

        //新面板出现
        $panel.show();
        anime.remove($panel.get(0));
        anime({
            targets: $panel.get(0),
            translateX: slideLeft ? ['100%', 0] : ['-100%', 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutCubic',
        });

        this.tabs.removeClass('tab-activated');
        this.panels.removeClass('tab-activated');
        $tab.addClass('tab-activated');
        $panel.addClass('tab-activated');
    }
    getTab (tab) {
        var $tab = $(tab).first();
        if (this.tabs.filter($tab).length == 0) {
            throw new Error('Tab is not found');
        }
        return $tab;
    }
    getPanel (tab) {
        var $tab = this.getTab(tab);
        var id = $tab.attr('ref-id');
        var $panel = this.panels.filter('#'+id);
        if (this.panels.filter($panel).length == 0) {
            throw new Error('Tab Panel ' + id + ' is not found');
        }
        return $panel;
    }
    getTabIndex (tab) {
        var $tab = this.getTab(tab);
        return this.tabs.index($tab);
    }
    getActiveTab () {
        return this.tabs.filter(function () {
            return $(this).hasClass('tab-activated');
        });
    }
    destroy() {
        this.tabs.off('click');
    }
}

// 抽屉
class Drawer {
    DEFAULT_OPTIONS = {
        position: 'left',
        width: 300,
    }
    constructor (selector, options = {}) {
        options = Object.assign(this.DEFAULT_OPTIONS, options);
        this.element = $(selector).first();
        this.element.addClass('drawer-'+options.position);
        this.element.wrapInner('<div class="content"></div>');
        this.element.append('<div class="overlay"></div>');
        this.element.children('.content').width(options.width);
        this.bindEvents();
        if(this.element.hasClass('drawer-opened')) this.open();
        else this.element.addClass('drawer-closed');
    }
    bindEvents () {
        var that = this;
        var $overlay = this.element.children('.overlay');
        $overlay.on('click', function (event) {
            that.close();
        });
        $overlay.on('transitionend', function(event) {
            if(that.element.hasClass('drawer-opening')) {
                that.element.removeClass('drawer-opening').addClass('drawer-opened');
            }
            else if(that.element.hasClass('drawer-closing')) {
                that.element.removeClass('drawer-closing').addClass('drawer-closed');
            }
        });
    }
    isOpen () {
        return !this.element.hasClass('drawer-closed');
    }
    open () {
        this.element.addClass("drawer-preopen")
        this.element.removeClass('drawer-closed drawer-closing')
        
        let that = this;
        setTimeout(function(){
            that.element.addClass('drawer-opening')
            that.element.removeClass('drawer-preopen');
        }, 50);
        $('body').css('overflow', 'hidden');
    }
    close () {
        this.element.removeClass('drawer-opened drawer-opening')
        this.element.addClass("drawer-preclose")
        
        let that = this;
        setTimeout(function(){
            that.element.addClass('drawer-closing');
            that.element.removeClass('drawer-preclose');
        }, 50);
        $('body').css('overflow', 'auto');
    }
    toggle () {
        if(this.element.hasClass('drawer-opening')||this.element.hasClass('drawer-opened'))
        this.close();
        else this.open();
    }
    destroy() {
        var $overlay = this.element.children('.overlay');
        $overlay.off('click');
        $overlay.off('transitionend');
    }
}
class Modal {
    static defaultOptions = {
        width: '32rem',
        title: '',
        content: '',
        html: null,
        buttons: [],
        beforeOpen: null,
        afterOpen: null,
        beforeClose: null,
        afterClose: null,
        swalOptions: {},
    }
    static swal = window.Swal.mixin({
        showConfirmButton: false,
        showDenyButton: false,
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: '确认',
        denyButtonText: '拒绝',
        cancelButtonText: '取消',
        confirmButtonAriaLabel: '确认',
        denyButtonAriaLabel: '拒绝',
        cancelButtonAriaLabel: '取消'
    });
    constructor(...args) {
        this.options = Object.assign({}, Modal.defaultOptions);
        // constructor(content)
        // constructor(htmlNode)
        // constructor(options)
        if (args.length == 1) {
            let param = args[0];
            if (typeof param === 'string') {
                this.options.content = param;
            } else if (typeof param === 'object') {
                if (param instanceof Node) {
                    this.options.html = param.cloneNode(true);
                } else {
                    Object.assign(this.options, param);
                }
            }
        }
        // constructor(title, content)
        // constructor(content, htmlNode)
        // constructor(content, options)
        else if (args.length == 2) {
            let firstParam = args[0];
            let secondParam = args[1];
            if (typeof firstParam === 'string' && typeof secondParam === 'string') {
                this.options.title = firstParam;
                this.options.content = secondParam;
            } else if (typeof firstParam === 'string' && typeof secondParam === 'object') {
                if (secondParam instanceof Node) {
                    this.options.title = firstParam;
                    this.options.html = secondParam.cloneNode(true);
                } else {
                    Object.assign(this.options, secondParam);
                    this.options.content = secondParam;
                }
            }
        }
        // constructor(title, content, options)
        // constructor(title, htmlNode, options)
        else if (args.length == 3) {
            let firstParam = args[0];
            let secondParam = args[1];
            let thirdParam = args[2];
            this.options = Object.assign(Modal.defaultOptions, thirdParam);
            this.options.title = firstParam;
            if (typeof secondParam === 'string') {
                this.options.content = secondParam;
            } else if (typeof secondParam === 'object' && secondParam instanceof Node) {
                this.options.html = secondParam.cloneNode(true);
            }
        }
        this.swalInstance = null;
        let self = this;
        this.modalOptions = {
            title: this.options.title,
            width: this.options.width,
            html: this.options.html,
            text: this.options.content,
            willOpen: this.options.beforeOpen,
            didOpen: (...args) => {
                if (typeof self.options.afterOpen === 'function') {
                    self.options.afterOpen(...args);
                }
                self.opened = true;
            },
            willClose: this.options.beforeClose,
            didClose: (...args) => {
                if (typeof self.options.afterClose === 'function') {
                    self.options.afterClose(...args);
                }
                self.opened = false;
            },
            didDestroy: () => {
                self.opened = false;
            },
            showConfirmButton: this.options.buttons.includes('confirm'),
            showDenyButton: this.options.buttons.includes('deny'),
            showCancelButton: this.options.buttons.includes('cancel'),
        };
        Object.assign(this.modalOptions, this.options.swalOptions);
        this.opened = false;
    }
    open() {
        this.swalInstance = Modal.swal.fire(this.modalOptions);
    }
    close() {
        if (this.opened) {
            this.swalInstance.close();
            this.swalInstance = null;
        }
    }
    isOpened() {
        return this.opened;
    }
}