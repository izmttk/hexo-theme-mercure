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

    var menuDrawer = new Drawer('.nav-menu-drawer',{
        position: 'left',
        width: 272
    });
    $('.nav-menu-drawer .collapse').each(function () {
        var collapse = new Collapse(this);
    });
    $('.navigator .nav-left-drawer').click(function(){
        menuDrawer.toggle();
    });
    var navMenuToggleList = Array.from(document.querySelectorAll('.navigator .nav-menu .menu-toggle'));
    var navMenuList = navMenuToggleList.map(function (menuToggleEl) {
        var isRootNav = menuToggleEl.parentElement.classList.contains('nav-menu-item');
        if(!isRootNav) {

            menuToggleEl.insertAdjacentHTML('beforeend','<i class="ri-arrow-right-s-fill"></i>');
        }
        menuToggleEl.nextElementSibling.style.display = 'block';
        var menu = new Menu(menuToggleEl, menuToggleEl.nextElementSibling, {
            arrow: isRootNav,
            position: isRootNav ? 'bottom-start' : 'right-start',
            trigger: 'hover',
            appendTo: isRootNav ? () => document.body : 'parent',
        });
    });
}
//初始化侧边栏抽屉
function initNavSidebar() {
    var sidebarDrawer = new Drawer('.nav-sidebar-drawer',{
        position: 'right',
        width: 278
    });
    $('.navigator .nav-right-drawer').click(function(){
        sidebarDrawer.toggle();
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
        var toc = new Toc('#sidebar .toc');
    if ($('#sidebar-drawer .toc').length > 0)
        var toc = new Toc('#sidebar-drawer .toc');
}
function initNavbar() {
    var $navbar = $('.navigator');
    var $sidebar = $('#sidebar');
    var preScrollTop = $(window).scrollTop();
    if(!window.blog.header) {
        $navbar.addClass('nav-noheader');
    }
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
        var tabs = new Tabs('#sidebar .tabs');
    if ($('#sidebar-drawer .tabs').length > 0)
        var tabs = new Tabs('#sidebar-drawer .tabs');
}
//初始化导航栏搜索功能
function initNavSearch() {
    var template = $($('#site_search_template').html());
    $('.nav-toolkit .search-toggle').on('click', function () {
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
function intiHeader() {
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
    // var content = $('#header .parallax-content').get(0);
    // if (content)
    //     parallaxInstance2 = new Parallax(content, {
    //         // selector: '.content',
    //         relativeInput: true,
    //         // inputElement: '.parallax-background',
    //         // clipRelativeInput: true,
    //         invertX: false,
    //         invertY: false,
    //         hoverOnly: true,
    //         scalarX: 5,
    //         scalarY: 5,
    //     });
    $('.indicator').on('click', function() {
        anime({
            targets: document.documentElement,
            scrollTop: document.querySelector('#main').offsetTop,
            easing: 'easeOutCubic',
            duration: 1000,
        });
    })

}


initNavbar();
initNavMenu();
initNavSidebar();
initNavSearch();
initNavMusicPlayer();
initCategoryTree();
initSidebarToc();
initSidebarTabs();
anchorSmoothScroll();
intiHeader();

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
    
    if(document.querySelector('#back-to-top-btn') !== null) {
        document.querySelector('#back-to-top-btn').addEventListener('click', function(event) {
            anime({
                targets: document.documentElement,
                scrollTop: 0,
                easing: 'easeOutCubic',
                duration: 1000,
            });
        });
    }
    if(document.querySelector('#go-to-commit-btn') !== null) {
        document.querySelector('#go-to-commit-btn').addEventListener('click', function(event) {
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