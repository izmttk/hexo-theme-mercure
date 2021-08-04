 //可折叠面板
 var Collapse = (function () {
    function Collapse(selector, options = {}) {
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
    Collapse.prototype.bindEvents = function () {
        var that = this;
        this.items.children('.collapse-item-title').on('click', function (event) {
            if ($(event.target).is('a')) return;
            var $title = $(this);
            var $item = that.getItem($title.parent());
            that.toggle($item, 200);
        });
    }
    Collapse.prototype.getItem = function (item) {
        if (typeof item === 'number') return this.items.eq(item);
        var $item = $(item).first();
        if (!$item.parent().is(this.element)) {
            throw new Error('Item is not the children of Collapse element');
        }
        return $item;
    }
    Collapse.prototype.isOpen = function (item) {
        var $item = this.getItem(item);
        return $item.hasClass('collapse-item-open');
    }
    Collapse.prototype.open = function (item, duration = 200) {
        var $item = this.getItem(item);
        var $content = $item.children('.collapse-item-content');
        if (!$content.length) return;
        $content.stop();
        $item.addClass('collapse-item-open');
        $item.trigger('open');
        var contentHeight = $content[0].scrollHeight;
        $content.animate({ height: contentHeight }, duration, function () {
            $content.css({ height: 'auto', overflow: 'auto' })
        });
    }
    Collapse.prototype.close = function (item, duration = 200) {
        var $item = this.getItem(item);
        var $content = $item.children('.collapse-item-content');
        if (!$content.length) return;
        $content.stop();
        $item.removeClass('collapse-item-open');
        $item.trigger('close');
        $content.css({ overflow: 'hidden' });
        $content.animate({ height: 0 }, duration);
    }
    Collapse.prototype.toggle = function (item, duration = 200) {
        if (this.isOpen(item)) this.close(item, duration);
        else this.open(item, duration);
    }
    return Collapse;
})();
//菜单
var Menu = (function () {
    var DEFAULT_OPTIONS = {
        position: 'bottom-start',
        arrow: false,
        animation: 'shift-away',
        theme: 'light-border',
        trigger: 'click',
        appendTo: () => document.body,
    }
    function Menu(toggle, content, options = {}) {
        options = Object.assign(DEFAULT_OPTIONS, options);
        this.instance = tippy($(toggle).get(0), {
            content: $(content).get(0),
            theme: options.theme,
            animation: options.animation,
            trigger: options.trigger=='hover' ? 'mouseenter focus' : 'click',
            interactive: true,
            interactiveDebounce: 50,
            placement: options.position,
            arrow: options.arrow,
            appendTo: options.appendTo,
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
        });
    }
    Menu.prototype.open = function() {
        this.instance.show();
    }
    Menu.prototype.close = function() {
        this.instance.hide();
    }
    Menu.prototype.toggle = function() {
        if(this.instance.state.isShown)
        this.close();
        else this.open();
    }
    return Menu;
})();
//目录
var Toc = (function () {
    function Toc(selector, options = {}) {
        var that = this;
        this.element = $(selector).first();
        var $container = this.element.parent();
        $container.css('position', 'relative');
        this.items = this.element.find('.toc-item');
        this.bindEvents();
    }
    Toc.prototype.bindEvents = function () {
        var that = this;
        // this.items.children('.toc-link').on('click', function (event) {
        //     event.preventDefault();
        //     var $item = $(this).parent();
        //     // that.activateTocItem($item);
        //     var $header = that.getHeader($item);
        //     $('html,body').animate({
        //         scrollTop: $header.offset().top - 76
        //     },400);
        // });
        $(window).on('scroll', $.throttle(function (event) {
            that.updateView();
        }, 50));
        
        this.updateView();
    }
    Toc.prototype.updateView = function () {
        var scrollTop = $(window, document).scrollTop();
        for (var i = 0; i < this.items.length; i++) {
            var $curItem = this.items.eq(i);
            var $curHeader = this.getHeader($curItem);
            var curOffsetTop = $curHeader.offset().top;
            //检测最后一个标题
            if (i == this.items.length - 1) {
                if (curOffsetTop - scrollTop <= 80)
                    this.activateTocItem($curItem);
                break;
            }
            var $nextItem = this.items.eq(i + 1);
            var $nextHeader = this.getHeader($nextItem);
            var nextOffsetTop = $nextHeader.offset().top;
            //检测是否处于当前标题下内容里
            if (curOffsetTop - scrollTop <= 80 && nextOffsetTop - scrollTop > 80) {
                this.activateTocItem($curItem);
                break;
            }
        }
    }
    Toc.prototype.getHeader = function (item) {
        var id = decodeURI(item.children('.toc-link').attr('href'));
        var $target = $(id);
        return $target;
    }
    Toc.prototype.activateTocItem = function (item) {
        var $item = $(item).first();
        if ($item.hasClass('toc-activated')) return;

        this.items.removeClass('toc-activated');
        var $container = this.element.parent();
        $item.addClass('toc-activated');
        $container.stop().animate({
            scrollTop: $item.offset().top - this.element.offset().top - $container.height() / 2
        }, 200);
    }
    return Toc;
})();
//标签页
var Tabs = (function () {
    function Tabs(selector, options = {}) {
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
    Tabs.prototype.initGliderPos = function () {
        //初始化滑块位置
        var $glider = this.element.find('.glider');
        // $glider.height(this.tabs.outerHeight());
        // $glider.width($activeTab.outerWidth());
        $glider.height(28);
        $glider.width(114);
        // var tabOffsetLeft = $($activeTab).offset().left - this.tabs.offset().left;
        var tabOffsetLeft = 114 * this.getTabIndex(this.getActiveTab());
        // console.log(tabOffsetLeft)
        $glider.css('transform', 'translateX(' + tabOffsetLeft + 'px)');
    }
    Tabs.prototype.bindEvents = function () {
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
                width: tabWidth
            });
        });
    }
    Tabs.prototype.switch = function (tab) {
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
            duration: 500,
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
            duration: 500,
            easing: 'easeOutCubic',
        });

        this.tabs.removeClass('tab-activated');
        this.panels.removeClass('tab-activated');
        $tab.addClass('tab-activated');
        $panel.addClass('tab-activated');
    }
    Tabs.prototype.getTab = function (tab) {
        var $tab = $(tab).first();
        if (this.tabs.filter($tab).length == 0) {
            throw new Error('Tab is not found');
        }
        return $tab;
    }
    Tabs.prototype.getPanel = function (tab) {
        var $tab = this.getTab(tab);
        var id = $tab.attr('href');
        var $panel = this.panels.filter(id);
        if (this.panels.filter($panel).length == 0) {
            throw new Error('Tab Panel is not found');
        }
        return $panel;
    }
    Tabs.prototype.getTabIndex = function(tab) {
        var $tab = this.getTab(tab);
        return this.tabs.index($tab);
    }
    Tabs.prototype.getActiveTab = function () {
        return this.tabs.filter(function () {
            return $(this).hasClass('tab-activated');
        });
    }
    return Tabs;
})();
//模态框
var Modal = (function () {
    function Modal(context) {
        if (typeof context !== 'string') context = $(context);
        else context = $('<span>' + context + '</span>');
        this.overlay = $('<div class="modal-layout"></div>');
        this.overlay.css({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 50,
            // backgroundColor: 'rgba(0, 0, 0, 0)',
            // backdropFilter: 'blur(0px)',
        });
        this.closeBtn = $('<button class="close-btn"><i class="ri-close-fill"></i></button>');
        this.overlay.append(this.closeBtn);
        this.context = $('<div class="content"></div>').append(context);
        anime.set(this.context.get(0), {
            opacity: 0,
            translateY: 100
        });
        this.overlay.append(this.context);
        $('body').append(this.overlay);
        this.overlay.hide();
        this.bindEvents();
    }
    Modal.prototype.bindEvents = function () {
        var that = this;
        this.closeBtn.on('click', function (event) {
            that.close();
        });
    }
    Modal.prototype.isOpen = function () {
        return this.overlay.hasClass('modal-open');
    }
    Modal.prototype.open = function () {
        $('body').css('overflow', 'hidden');
        // $('body').append(this.overlay);
        this.overlay.show();
        this.overlay.addClass('modal-open');
        anime({
            targets: this.context.get(0),
            opacity: 1,
            translateY: 0,
            easing: 'easeOutCubic',
            duration: 800
        });
        anime({
            targets: this.overlay.get(0),
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            // backdropFilter: 'blur(16px)',
            easing: 'easeOutCubic',
            duration: 500
        });
    }
    Modal.prototype.close = function () {
        this.overlay.removeClass('modal-open');
        var that = this;
        $('body').css('overflow', 'auto');
        anime({
            targets: this.context.get(0),
            opacity: 0,
            translateY: 100,
            easing: 'easeOutCubic',
            duration: 800
        });
        anime({
            targets: this.overlay.get(0),
            backgroundColor: 'rgba(0, 0, 0, 0)',
            // backdropFilter: 'blur(0px)',
            easing: 'easeOutCubic',
            duration: 500
        }).finished.then(function () {
            // that.overlay.detach();
            that.overlay.remove();
            delete that;
        });
    }
    Modal.prototype.toggle = function () {
        if (this.isOpen()) this.close();
        else this.open();
    }
    return Modal;
})();
// 抽屉
var Drawer = (function () {
    DEFAULT_OPTIONS = {
        position: 'left',
        width: 300,
    }
    function Drawer(selector, options = {}) {
        options = Object.assign(DEFAULT_OPTIONS, options);
        this.element = $(selector).first();
        this.element.addClass('drawer-'+options.position);
        this.element.wrapInner('<div class="content"></div>');
        this.element.append('<div class="overlay"></div>');
        this.element.children('.content').width(options.width);
        this.bindEvents();
        if(this.element.hasClass('drawer-opened')) this.open();
        else this.element.addClass('drawer-closed');
    }
    Drawer.prototype.bindEvents = function () {
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
    Drawer.prototype.open = function () {
        this.element.addClass("drawer-preopen")
        this.element.removeClass('drawer-closed drawer-closing')
        
        let that = this;
        setTimeout(function(){
            that.element.addClass('drawer-opening')
            that.element.removeClass('drawer-preopen');
        }, 50);
        $('body').css('overflow', 'hidden');
    }
    Drawer.prototype.close = function () {
        this.element.removeClass('drawer-opened drawer-opening')
        this.element.addClass("drawer-preclose")
        
        let that = this;
        setTimeout(function(){
            that.element.addClass('drawer-closing');
            that.element.removeClass('drawer-preclose');
        }, 50);
        $('body').css('overflow', 'auto');
    }
    Drawer.prototype.toggle = function () {
        if(this.element.hasClass('drawer-opening')||this.element.hasClass('drawer-opened'))
        this.close();
        else this.open();
    }
    return Drawer;
})();