$.extend({
    //消抖
    debounce: function(fn, timeout, invokeAsap, ctx) {
        if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
            ctx = invokeAsap;
            invokeAsap = false;
        }
        var timer;
        return function() {
            var args = arguments;
            ctx = ctx || this;
            invokeAsap && !timer && fn.apply(ctx, args);
            clearTimeout(timer);
            timer = setTimeout(function() {
                invokeAsap || fn.apply(ctx, args);
                timer = null;
            }, timeout);
        };
    },
    //节流
    throttle: function(fn, timeout, ctx) {
        var timer, args, needInvoke;
        return function() {
            args = arguments;
            needInvoke = true;
            ctx = ctx || this;
            timer || (function() {
                if(needInvoke) {
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
//初始化导航条菜单
function initNavMenu() {
    var navMenuToggleList = [].slice.call(document.querySelectorAll('.navigator .menu-toggle'));
    var navMenuList = navMenuToggleList.map(function (menuToggleEl) {
        var isRootNav = menuToggleEl.parentElement.classList.contains("nav-menu-item");
        tippy(menuToggleEl, {
            content: menuToggleEl.nextElementSibling,
            theme: 'light',
            animation: 'shift-away',
            // trigger: 'click',
            interactive: true,
            interactiveDebounce: 120,
            placement: isRootNav?'bottom-start':'right-start',
            arrow: isRootNav,
            // hideOnClick: false,
            offset: [-6, -6],
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
    });
}
//初始化分类树
function initCategoryTree() {
    //可折叠面板
    var Collapse = (function () {
        function Collapse(selector,options) {
            var that = this;
            this.element = $(selector).first();
            this.items = this.element.children('.collapse-item');
            this.options = Object.assign({
            },options);
            this.bindEvents();
            this.items.each(function () {
                if(that.isOpen(this)) that.open(this,0);
                else that.close(this,0);
            });
        }
        Collapse.prototype.bindEvents = function () {
            var that = this;
            this.items.children('.collapse-item-title').on('click', function (event) {
                if ($(event.target).is('a')) return;
                var $title = $(this);
                var $item = that.getItem($title.parent());
                that.toggle($item,200);
            });
        }
        Collapse.prototype.getItem = function (item) {
            if(typeof item === 'number') return this.items.eq(item);
            var $item = $(item).first();
            if(!$item.parent().is(this.element)) {
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
            if(!$content.length) return;
            $content.stop();
            $item.addClass('collapse-item-open');
            $item.trigger('open');
            var contentHeight = $content[0].scrollHeight;
            $content.animate({height:contentHeight},duration,function () {
                $content.css({height: 'auto', overflow: 'auto'})
            });
        }
        Collapse.prototype.close = function (item, duration = 200) {
            var $item = this.getItem(item);
            var $content = $item.children('.collapse-item-content');
            if(!$content.length) return;
            $content.stop();
            $item.removeClass('collapse-item-open');
            $item.trigger('close');
            $content.css({overflow: 'hidden'});
            $content.animate({height:0},duration);
        }
        Collapse.prototype.toggle = function (item, duration = 200) {
            if(this.isOpen(item)) this.close(item, duration);
            else this.open(item, duration);
        }
        return Collapse;
    })();
    //文件夹图标打开关闭变化
    $('.collapse').children('.collapse-item').on('open close', function (event) {
        event.stopPropagation();
        var $item = $(this);
        var $title = $item.children('.collapse-item-title');
        $title.children('.prefix').remove();
        var $name = $title.children('.name');
        if(event.type === 'open')
        $name.before('<span class="prefix"><i class="ri-folder-open-fill"></i></span>');
        else
        $name.before('<span class="prefix"><i class="ri-folder-fill"></i></span>');
    });
    //实例化折叠面板
    $('.collapse').each(function () {
        var collapse = new Collapse(this);
    });
    //替换叶子节点图标
    $('.collapse .collapse-item').filter(function () {
        return $(this).has('.collapse').length === 0;
    }).each(function () {
        var $item = $(this);
        var $title = $item.children('.collapse-item-title');
        $title.children('.prefix').remove();
        var $name = $title.children('.name');
        $name.before('<span class="prefix"><i class="ri-bookmark-fill"></i></span>');
    });
}
function initSidebarToc() {
    var Toc = (function () {
        function Toc(selector, options) {
            var that = this;
            this.element = $(selector).first();
            var $container = this.element.parent();
            $container.css('position','relative');
            this.items = this.element.find('.toc-item');
            this.bindEvents();
        }
        Toc.prototype.bindEvents = function () {
            var that = this;
            this.items.children('.toc-link').on('click', function (event) {
                event.preventDefault();
                var $item = $(this).parent();
                // that.activateTocItem($item);
                var $header = that.getHeader($item);
                $('html,body').animate({
                    scrollTop: $header.offset().top - 76
                },400);
            });
            $(window).on('scroll', $.throttle(function(event) {
                var scrollTop = $(window,document).scrollTop();
                for(var i = 0; i < that.items.length; i++) {
                    var $curItem = that.items.eq(i);
                    var $curHeader = that.getHeader($curItem);
                    var curOffsetTop = $curHeader.offset().top;
                    //检测最后一个标题
                    if(i==that.items.length-1) {
                        if(curOffsetTop - scrollTop <= 80)
                        that.activateTocItem($curItem);
                        break;
                    }
                    var $nextItem = that.items.eq(i+1);
                    var $nextHeader = that.getHeader($nextItem);
                    var nextOffsetTop = $nextHeader.offset().top;
                    //检测是否处于当前标题下内容里
                    if(curOffsetTop - scrollTop <= 80 && nextOffsetTop - scrollTop > 80) {
                        that.activateTocItem($curItem);
                        break;
                    }
                }
            },200)).scroll();
        }
        Toc.prototype.getHeader = function (item) {
            var id = decodeURI(item.children('.toc-link').attr('href'));
            var $target = $(id);
            return $target;
        }
        Toc.prototype.activateTocItem = function (item) {
            var $item = $(item).first();
            if($item.hasClass('toc-activated')) return;
            
            this.items.removeClass('toc-activated');
            var $container = this.element.parent();
            $item.addClass('toc-activated');
            $container.stop().animate({
                scrollTop: $item.offset().top - this.element.offset().top - $container.height()/2
            },200);
        }
        return Toc;
    })();
    if($('.toc').length>0)
    var toc = new Toc('.toc');
}
function initNavBar() {
    var $navbar = $('.navigator');
    function showNavBar() {
        if(!$navbar.hasClass('nav-hide')) return;
        $navbar.removeClass('nav-hide');
        $navbar.stop().show().animate({
            top: 0
        },400);
    }
    function hideNavBar() {
        if($navbar.hasClass('nav-hide')) return;
        $navbar.addClass('nav-hide');
        $navbar.stop().animate({
            top: - $navbar.height()
        },400,function () {
            $navbar.hide();
        });
    }
    var preScrollTop = $(window).scrollTop();
    $(window).on('scroll',$.throttle(function (event) {
        var scrollTop = $(window).scrollTop();
        if(scrollTop - preScrollTop > 0) {
            hideNavBar();
        }
        else {
            showNavBar();
        }
        preScrollTop = scrollTop;

    },200));
}
initNavMenu();
initCategoryTree();
initSidebarToc();
initNavBar();
// var $ = JQ;
// $.fn.transitionEnd = function (callback) {
//     // eslint-disable-next-line @typescript-eslint/no-this-alias
//     var that = this;
//     var events = ['webkitTransitionEnd', 'transitionend'];
//     function fireCallback(e) {
//         if (e.target !== this) {
//             return;
//         }
//         // @ts-ignore
//         callback.call(this, e);
//         $.each(events, function (_, event) {
//             that.off(event, fireCallback);
//         });
//     }
//     $.each(events, function (_, event) {
//         that.on(event, fireCallback);
//     });
//     return this;
// };
// $.fn.transformOrigin = function (transformOrigin) {
//     return this.each(function () {
//         this.style.webkitTransformOrigin = transformOrigin;
//         this.style.transformOrigin = transformOrigin;
//     });
// };

// $.throttle = function (fn, delay) {
//     if (delay === void 0) { delay = 16; }
//     var timer = null;
//     return function () {
//         var _this = this;
//         var args = [];
//         for (var _i = 0; _i < arguments.length; _i++) {
//             args[_i] = arguments[_i];
//         }
//         if (timer === null) {
//             timer = setTimeout(function () {
//                 fn.apply(_this, args);
//                 timer = null;
//             }, delay);
//         }
//     };
// };


// var Menu = (function () {
//     function Menu(anchorSelector, menuSelector, options) {
//         var _this = this;
//         if (options === void 0) { options = {}; }
//         //配置参数
//         this.options = {
//             position: 'auto',
//             align: 'auto',
//             gutter: 16,
//             fixed: false,
//             covered: 'auto',
//             subMenuTrigger: 'hover'
//         };
//         //当前菜单状态
//         this.state = 'closed';
//         this.$anchor = $(anchorSelector).first();
//         this.$element = $(menuSelector).first();
//         // 触发菜单的元素 和 菜单必须是同级的元素，否则菜单可能不能定位
//         if (!this.$anchor.parent().is(this.$element.parent())) {
//             throw new Error('anchorSelector and menuSelector must be siblings');
//         }
//         $.extend(this.options, options);
//         // 是否是级联菜单
//         this.isCascade = this.$element.hasClass('menu-cascade');
//         // covered 参数处理
//         this.isCovered =
//             this.options.covered === 'auto' ? !this.isCascade : this.options.covered;
//         // 点击触发菜单切换
//         this.$anchor.on('click', function () { return _this.toggle(); });
//         // 点击菜单外面区域关闭菜单
//         $(document).on('click touchstart', function (event) {
//             var $target = $(event.target);
//             if (_this.isOpen() &&
//                 !$target.is(_this.$element) &&
//                 !$.contains(_this.$element[0], $target[0]) &&
//                 !$target.is(_this.$anchor) &&
//                 !$.contains(_this.$anchor[0], $target[0])) {
//                 _this.close();
//             }
//         });
//         // 点击不含子菜单的菜单条目关闭菜单
//         var that = this;
//         $(document).on('click', '.menu-item', function () {
//             var $item = $(this);
//             if (!$item.find('.menu-list').length &&
//                 $item.attr('disabled') === undefined) {
//                 that.close();
//             }
//         });
//         // 绑定点击或鼠标移入含子菜单的条目的事件
//         this.bindSubMenuEvent();
//         // 窗口大小变化时，重新调整菜单位置
//         $(window).on('resize', $.throttle(function () { return _this.readjust(); }, 100));
//     }
//     /**
//      * 是否为打开状态
//      */
//     Menu.prototype.isOpen = function () {
//         return this.state === 'opening' || this.state === 'opened';
//     };
//     /**
//      * 调整主菜单位置
//      */
//     Menu.prototype.readjust = function () {
//         var menuLeft;
//         var menuTop;
//         // 菜单位置和方向
//         var position;
//         var align;
//         // window 窗口的宽度和高度
//         var windowHeight = $(window).height();
//         var windowWidth = $(window).width();
//         // 配置参数
//         var gutter = this.options.gutter;
//         var isCovered = this.isCovered;
//         var isFixed = this.options.fixed;
//         // 动画方向参数
//         var transformOriginX;
//         var transformOriginY;
//         // 菜单的原始宽度和高度
//         var menuWidth = this.$element.width();
//         var menuHeight = this.$element.height();
//         // 触发菜单的元素在窗口中的位置
//         var anchorRect = this.$anchor[0].getBoundingClientRect();
//         var anchorTop = anchorRect.top;
//         var anchorLeft = anchorRect.left;
//         var anchorHeight = anchorRect.height;
//         var anchorWidth = anchorRect.width;
//         var anchorBottom = windowHeight - anchorTop - anchorHeight;
//         var anchorRight = windowWidth - anchorLeft - anchorWidth;
//         // 触发元素相对其拥有定位属性的父元素的位置
//         var anchorOffsetTop = this.$anchor[0].offsetTop;
//         var anchorOffsetLeft = this.$anchor[0].offsetLeft;
//         // 自动判断菜单位置
//         if (this.options.position === 'auto') {
//             if (anchorBottom + (isCovered ? anchorHeight : 0) > menuHeight + gutter) {
//                 // 判断下方是否放得下菜单
//                 position = 'bottom';
//             }
//             else if (anchorTop + (isCovered ? anchorHeight : 0) >
//                 menuHeight + gutter) {
//                 // 判断上方是否放得下菜单
//                 position = 'top';
//             }
//             else {
//                 // 上下都放不下，屏幕居中显示
//                 position = 'center';
//             }
//         }
//         else {
//             position = this.options.position;
//         }
//         // 自动判断菜单对齐方式
//         if (this.options.align === 'auto') {
//             if (anchorRight + anchorWidth > menuWidth + gutter) {
//                 // 判断右侧是否放得下菜单
//                 align = 'left';
//             }
//             else if (anchorLeft + anchorWidth > menuWidth + gutter) {
//                 // 判断左侧是否放得下菜单
//                 align = 'right';
//             }
//             else {
//                 // 左右都放不下，屏幕居中显示
//                 align = 'center';
//             }
//         }
//         else {
//             align = this.options.align;
//         }
//         // 设置菜单位置
//         if (position === 'bottom') {
//             transformOriginY = '0';
//             menuTop =
//                 (isCovered ? 0 : anchorHeight) +
//                     (isFixed ? anchorTop : anchorOffsetTop) - 8;
//         }
//         else if (position === 'top') {
//             transformOriginY = '100%';
//             menuTop =
//                 (isCovered ? anchorHeight : 0) +
//                     (isFixed ? anchorTop - menuHeight : anchorOffsetTop - menuHeight) + 8;
//         }
//         else {
//             transformOriginY = '50%';
//             // =====================在窗口中居中
//             // 显示的菜单的高度，简单菜单高度不超过窗口高度，若超过了则在菜单内部显示滚动条
//             // 级联菜单内部不允许出现滚动条
//             var menuHeightTemp = menuHeight;
//             // 简单菜单比窗口高时，限制菜单高度
//             if (!this.isCascade) {
//                 if (menuHeight + gutter * 2 > windowHeight) {
//                     menuHeightTemp = windowHeight - gutter * 2;
//                     this.$element.height(menuHeightTemp);
//                 }
//             }
//             menuTop =
//                 (windowHeight - menuHeightTemp) / 2 +
//                     (isFixed ? 0 : anchorOffsetTop - anchorTop);
//         }
//         this.$element.css('top', menuTop + "px");
//         // 设置菜单对齐方式
//         if (align === 'left') {
//             transformOriginX = '0';
//             menuLeft = (isFixed ? anchorLeft : anchorOffsetLeft)-4;
//         }
//         else if (align === 'right') {
//             transformOriginX = '100%';
//             menuLeft = (isFixed
//                 ? anchorLeft + anchorWidth - menuWidth
//                 : anchorOffsetLeft + anchorWidth - menuWidth)+4;
//         }
//         else {
//             transformOriginX = '50%';
//             //=======================在窗口中居中
//             // 显示的菜单的宽度，菜单宽度不能超过窗口宽度
//             var menuWidthTemp = menuWidth;
//             // 菜单比窗口宽，限制菜单宽度
//             if (menuWidth + gutter * 2 > windowWidth) {
//                 menuWidthTemp = windowWidth - gutter * 2;
//                 this.$element.width(menuWidthTemp);
//             }
//             menuLeft =
//                 (windowWidth - menuWidthTemp) / 2 +
//                     (isFixed ? 0 : anchorOffsetLeft - anchorLeft);
//         }
//         this.$element.css('left', menuLeft + "px");
//         // 设置菜单动画方向
//         this.$element.transformOrigin(transformOriginX + " " + transformOriginY);
//     };
//     /**
//      * 调整子菜单的位置
//      * @param $submenu
//      */
//     Menu.prototype.readjustSubmenu = function ($submenu) {
//         var $item = $submenu.parent('.menu-item');
//         var submenuTop;
//         var submenuLeft;
//         // 子菜单位置和方向
//         var position;
//         var align;
//         // window 窗口的宽度和高度
//         var windowHeight = $(window).height();
//         var windowWidth = $(window).width();
//         // 动画方向参数
//         var transformOriginX;
//         var transformOriginY;
//         // 子菜单的原始宽度和高度
//         var submenuWidth = $submenu.width();
//         var submenuHeight = $submenu.height();
//         // 触发子菜单的菜单项的宽度高度
//         var itemRect = $item[0].getBoundingClientRect();
//         var itemWidth = itemRect.width;
//         var itemHeight = itemRect.height;
//         var itemLeft = itemRect.left;
//         var itemTop = itemRect.top;
//         // 判断菜单上下位置
//         if (windowHeight - itemTop > submenuHeight) {
//             // 判断下方是否放得下菜单
//             position = 'bottom';
//         }
//         else if (itemTop + itemHeight > submenuHeight) {
//             // 判断上方是否放得下菜单
//             position = 'top';
//         }
//         else {
//             // 默认放在下方
//             position = 'bottom';
//         }
//         // 判断菜单左右位置
//         if (windowWidth - itemLeft - itemWidth > submenuWidth) {
//             // 判断右侧是否放得下菜单
//             align = 'left';
//         }
//         else if (itemLeft > submenuWidth) {
//             // 判断左侧是否放得下菜单
//             align = 'right';
//         }
//         else {
//             // 默认放在右侧
//             align = 'left';
//         }
//         // 设置菜单位置
//         if (position === 'bottom') {
//             transformOriginY = '0';
//             submenuTop = -8;
//         }
//         else if (position === 'top') {
//             transformOriginY = '100%';
//             submenuTop = -submenuHeight + itemHeight + 8;
//         }
//         $submenu.css('top', submenuTop + "px");
//         // 设置菜单对齐方式
//         if (align === 'left') {
//             transformOriginX = '0';
//             submenuLeft = itemWidth - 8;
//         }
//         else if (align === 'right') {
//             transformOriginX = '100%';
//             submenuLeft = -submenuWidth + 8;
//         }
//         $submenu.css('left', submenuLeft + "px");
//         // 设置菜单动画方向
//         $submenu.transformOrigin(transformOriginX + " " + transformOriginY);
//     };
//     /**
//      * 打开子菜单
//      * @param $submenu
//      */
//     Menu.prototype.openSubMenu = function ($submenu) {
//         this.readjustSubmenu($submenu);
//         $submenu
//             .addClass('menu-open')
//             .parent('.menu-item')
//             .addClass('menu-item-active');
//     };
//     /**
//      * 关闭子菜单，及其嵌套的子菜单
//      * @param $submenu
//      */
//     Menu.prototype.closeSubMenu = function ($submenu) {
//         // 关闭子菜单
//         $submenu
//             .removeClass('menu-open')
//             .parent('.menu-item')
//             .removeClass('menu-item-active');
//         // 循环关闭嵌套的子菜单
//         $submenu.find('.menu-list').each(function (_, menu) {
//             var $subSubmenu = $(menu);
//             $subSubmenu
//                 .removeClass('menu-open')
//                 .parent('.menu-item')
//                 .removeClass('menu-item-active');
//         });
//     };
//     /**
//      * 切换子菜单状态
//      * @param $submenu
//      */
//     Menu.prototype.toggleSubMenu = function ($submenu) {
//         $submenu.hasClass('menu-open')
//             ? this.closeSubMenu($submenu)
//             : this.openSubMenu($submenu);
//     };
//     /**
//      * 绑定子菜单事件
//      */
//     Menu.prototype.bindSubMenuEvent = function () {
//         var that = this;
//         var $item = this.$element.find('.menu-item').filter(function(){
//             if($(this).attr('disabled') !== undefined)
//                 return false;
//             if($(this).children('.menu-list').length==0)
//                 return false;
//             return true;
//         });
//         // 点击打开子菜单
//         if (this.options.subMenuTrigger === 'click') {
//             $item.on('click', function(event){
//                 var $submenu = $(this).children('.menu-list');
//                 that.toggleSubMenu($submenu);
//                 //阻止冒泡
//                 event.stopPropagation();
//             });
//         }
//         // 悬浮打开子菜单
//         if (this.options.subMenuTrigger === 'hover') {
//             $item.on('mouseenter mouseleave', function(event){
//                 var $submenu = $(this).children('.menu-list');
//                 if(event.type === 'mouseenter') {
//                     that.openSubMenu($submenu);
//                 }
//                 if(event.type === 'mouseleave') {
//                     that.closeSubMenu($submenu);
//                 }
//             });
//         }
//     };
//     /**
//      * 动画结束回调
//      */
//     Menu.prototype.transitionEnd = function () {
//         if (this.state === 'opening') {
//             this.state = 'opened';
//         }
//         if (this.state === 'closing') {
//             this.state = 'closed';
//         }
//     };
//     /**
//      * 切换菜单状态
//      */
//     Menu.prototype.toggle = function () {
//         this.isOpen() ? this.close() : this.open();
//     };
//     /**
//      * 打开菜单
//      */
//     Menu.prototype.open = function () {
//         var _this = this;
//         if (this.isOpen()) {
//             return;
//         }
//         this.state = 'opening';
//         this.readjust();
//         this.$element
//             // 菜单隐藏状态使用使用 fixed 定位。
//             .css('position', this.options.fixed ? 'fixed' : 'absolute')
//             .addClass('menu-open')
//             .transitionEnd(function () { return _this.transitionEnd(); });
//     };
//     /**
//      * 关闭菜单
//      */
//     Menu.prototype.close = function () {
//         var _this = this;
//         if (!this.isOpen()) {
//             return;
//         }
//         this.state = 'closing';
//         // 菜单开始关闭时，关闭所有子菜单
//         this.$element.find('.menu-list').each(function (_, submenu) {
//             _this.closeSubMenu($(submenu));
//         });
//         this.$element
//             .removeClass('menu-open')
//             .transitionEnd(function () { return _this.transitionEnd(); });
//     };
//     return Menu;
// }());