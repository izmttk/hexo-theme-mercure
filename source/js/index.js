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
//初始化导航条菜单
function initNavMenu() {
    var navDrawer = new Drawer('.nav-menu-drawer');
    $('.nav-menu-drawer .collapse').each(function () {
        var collapse = new Collapse(this);
    });
    var navMenuToggleList = [].slice.call(document.querySelectorAll('.navigator .nav-menu .menu-toggle'));
    var navMenuList = navMenuToggleList.map(function (menuToggleEl) {
        var isRootNav = menuToggleEl.parentElement.classList.contains("nav-menu-item");
        menuToggleEl.nextElementSibling.style.display = 'block';
        var menu = new Menu(menuToggleEl, menuToggleEl.nextElementSibling, {
            arrow: isRootNav,
            position: isRootNav ? 'bottom-start' : 'right-start',
            trigger: 'hover',
        });
    });
}
//初始化分类树
function initCategoryTree() {
   
    //文件夹图标打开关闭变化
    $('.category-tree .collapse').children('.collapse-item').on('open close', function (event) {
        event.stopPropagation();
        var $item = $(this);
        var $title = $item.children('.collapse-item-title');
        $title.children('.prefix').remove();
        var $name = $title.children('.name');
        if (event.type === 'open')
            $name.before('<span class="prefix"><i class="ri-folder-open-fill"></i></span>');
        else
            $name.before('<span class="prefix"><i class="ri-folder-fill"></i></span>');
    });
    //实例化折叠面板
    $('.category-tree .collapse').each(function () {
        var collapse = new Collapse(this);
    });
    //替换叶子节点图标
    $('.category-tree .collapse .collapse-item').filter(function () {
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
    if ($('#sidebar .toc').length > 0)
        var toc = new Toc('.toc');
}
function initNavbar() {
    var $navbar = $('.navigator');
    var $sidebar = $('#sidebar');
    var preScrollTop = $(window).scrollTop();
    $(window).on('scroll', $.throttle(function (event) {
        var scrollTop = $(window).scrollTop();
        if (scrollTop <= 10) {
            $navbar.removeClass('nav-hide');
            $navbar.removeClass('nav-fix');
            $navbar.addClass('nav-top');
            $sidebar.find('.tabs').removeClass('headblank');
        }
        else {
            $navbar.removeClass('nav-top');
            $navbar.addClass('nav-fix');

            if (scrollTop - preScrollTop > 0) {
                $navbar.addClass('nav-hide');
                //向上滚动取消侧边栏头部留空
                $sidebar.find('.tabs').removeClass('headblank');
            }
            else {
                $navbar.removeClass('nav-hide');
                //向下滚动时若导航条覆盖侧边栏内容，则给侧边栏头部留空
                if ($sidebar.offset().top - $navbar.offset().top - $navbar.height() < 0) {
                    $sidebar.find('.tabs').addClass('headblank');
                }
                else {
                    $sidebar.find('.tabs').removeClass('headblank');
                }
            }
        }
        preScrollTop = scrollTop;
    }, 200)).scroll();
}
function initSidebarTabs() {
    if ($('#sidebar .tabs').length > 0)
        var tabs = new Tabs('.tabs');
}
function initSearch() {
    var template = $($('#site_search_template').html());
    $('.toolkit .search').on('click', function () {
        //防止打开多个搜索界面
        if ($('.modal-layout.modal-open').length != 0)
            return false;
        var context = template.clone();
        var modal = new Modal(context);
        var Search = new LocalSearch('search-input', 'search-result-wrap');
        modal.open();
        // 输入框获取焦点
        $('#search-input').focus();
        context.find('#search-input').on('keydown', function (event) {
            if (event.key === 'Enter') {
                if (!Search.isKeywordsChanged()) return false;
                $('#site_search').addClass('searched');

                anime({
                    targets: '#site_search  .form-group',
                    marginTop: '4rem',
                    easing: 'easeOutCubic',
                    duration: 500
                });
                Search.query();
            }
        });
        context.find('#search-btn').on('click', function () {
            if (!Search.isKeywordsChanged()) return false;
            $('#site_search').addClass('searched');
            anime({
                targets: '#site_search .form-group',
                marginTop: '4rem',
                easing: 'easeOutCubic',
                duration: 500
            });
            Search.query();
        });
    });
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
function initCoverParallax() {
    var scene = $('#header .parallax-background').get(0);
    if (scene)
        parallaxInstance = new Parallax(scene, {
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
    var content = $('#header .parallax-content').get(0);
    if (content)
        parallaxInstance2 = new Parallax(content, {
            // selector: '.content',
            relativeInput: true,
            // inputElement: '.parallax-background',
            // clipRelativeInput: true,
            invertX: false,
            invertY: false,
            hoverOnly: true,
            scalarX: 5,
            scalarY: 5,
        });

}
initNavbar();
initNavMenu();
initCategoryTree();
initSidebarToc();
initSidebarTabs();
initSearch();
anchorSmoothScroll();
initCoverParallax();


