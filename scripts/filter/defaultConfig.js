const { deepMerge } = require('hexo-util');
// https://github.com/hexojs/hexo-util#deepmergetarget-source
const { isBoolean } = require('../helper/typeof')
let siteConfig = hexo.config;
function themeConfig(config) {
    let THEME_CONFIG = {
        header: headerConfig(config),
        post_card: postCardConfig(config),
        plugins: pluginsConfig(config),
        footer: footerConfig(config),
        navigator: navigatorConfig(config),
        sidebar: sidebarConfig(config),
        search: searchConfig(config),
        loading: loadingConfig(config),
    }
    let configCopy = Object.assign({}, config);
    Object.assign(configCopy, THEME_CONFIG);
    return configCopy;
}

function booleanToObject(config) {
    let configCopy = null;
    if (isBoolean(config)) {
        configCopy = {
            enable: config,
        }
    } else {
        configCopy = Object.assign({}, config);
    }
    return configCopy;
}

function constructLayoutConfig(defalutConfig = {}, config = {}) {
    const publicConfig = {};
    for (const key in config) {
        if (key !== 'layout') {
            publicConfig[key] = config[key];
        }
    }
    const combinedConfig = {};
    for (const key in defalutConfig) {
        combinedConfig[key] = deepMerge(defalutConfig[key], publicConfig);
    }
    for (const key in config.layout) {
        if (!combinedConfig[key]) {
            combinedConfig[key] = deepMerge({}, publicConfig);
        }
        combinedConfig[key] = deepMerge(combinedConfig[key], config.layout[key]);
    }
    return combinedConfig;
}

function headerConfig(config) {
    const publicDefaultConfig = {
        enable: true,
        height: '400px',
        bottom_effect: 'none',
    }
    const defaultConfig = {
        default: deepMerge(publicDefaultConfig, {}),
        index: deepMerge(publicDefaultConfig, {
            cover: {
                type: 'normal',
                image: '/assets/defalut-bg.jpg',
            },
            title: siteConfig.title,
            description: {
                type: 'normal',
                content: siteConfig.description,
            },
            scroll_indicator: true,
        }),
        post: deepMerge(publicDefaultConfig, {
            cover: 'full',
        }),
        page: deepMerge(publicDefaultConfig, {
            cover: 'full',
        }),
        archive: deepMerge(publicDefaultConfig, {
            cover: 'full',
        }),
        tag: deepMerge(publicDefaultConfig, {
            cover: 'full',
        }),
        category: deepMerge(publicDefaultConfig, {
            cover: 'full',
        }),
    };
    const configCopy = booleanToObject(config?.header);
    return constructLayoutConfig(defaultConfig, configCopy);
}

function sidebarConfig(config) {
    const publicDefaultConfig = {
        enable: true,
        show_profile: true,
        show_tag_cloud: true,
        show_category_tree: true,
        show_toc: true
    }
    const defaultConfig = {
        default: deepMerge(publicDefaultConfig, {}),
    };
    const configCopy = booleanToObject(config?.sidebar);
    return constructLayoutConfig(defaultConfig, configCopy);
}

function navigatorConfig(config) {
    const publicDefaultConfig = {
        enable: true,
        logo: siteConfig.title,
        menu: config?.navigator ? [] : [
            {name: '分类', url: '/categories'},
            {name: '标签', url: '/tags'},
            {name: '归档', url: '/archives'},
        ],
        toolkit: {
            search: true,
            darkmode: true,
        }
    }
    const defaultConfig = {
        default: deepMerge(publicDefaultConfig, {}),
    };
    const configCopy = booleanToObject(config?.navigator);
    return constructLayoutConfig(defaultConfig, configCopy);
}

function footerConfig(config) {
    const publicDefaultConfig = {
        enable: true,
        text: null
    }
    const defaultConfig = {
        default: deepMerge(publicDefaultConfig, {}),
    };
    const configCopy = booleanToObject(config?.footer);
    return constructLayoutConfig(defaultConfig, configCopy);
}

function postCardConfig(config) {
    const defaultConfig = {
        cover: {
            type: 'blur',
            position: 'alter'
        }
    }
    let combinedConfig = deepMerge(defaultConfig, config?.post_card ?? {});
    return combinedConfig;
}

function pluginsConfig(config) {
    const defaultConfig = {
        katex: {
            enable: false,
        },
        anchor: {
            enable: false,
        },
        lazyload: {
            enable: false,
            loading_img: null,
            error_img: null,
        },
        pjax: {
            enable: true,
        },
        overlay_scrollbar: {
            enable: true,
        }
    }
    let configCopy = Object.assign({}, config?.plugins);
    for(let key in configCopy) {
        configCopy[key] = booleanToObject(configCopy[key]);
    }
    let combinedConfig = deepMerge(defaultConfig, configCopy);
    return combinedConfig;
}
function searchConfig(config) {
    const defaultConfig = {
        enable: false,
        local_search: {
            enable: false,
            placeholder: '请输入关键词开始搜索',
            searchAsYouType: false
        },
        algolia_search: {
            enable: false,
            configure:{
                enable: true,
                hitsPerPage: 8,
            },
            searchBox: {
                enable: true,
                placeholder: '请输入关键字开始搜索',
                searchAsYouType: false,
            },
            poweredBy: {
                enable: false,
            },
            hits: {
                enable: false,
            },
            infiniteHits: {
                enable: true,
            },
            stats: {
                enable: false,
            },
            pagination: {
                enable: false,
            }
        }
    }

    let configCopy = booleanToObject(config?.search);
    for(let key in configCopy) {
        if (key !== 'enable') {
            configCopy[key] = booleanToObject(configCopy[key]);
        }
    }
    let combinedConfig = deepMerge(defaultConfig, configCopy);
    return combinedConfig;
}
function loadingConfig(config) {
    const defaultConfig = {
        enable: true,
        image: {
            src: '/assets/ring-loading.gif',
            width: '80px',
            height: '80px',
        },
        text: '加载中...',
    }
    let configCopy = booleanToObject(config?.loading);
    let combinedConfig = deepMerge(defaultConfig, configCopy);
    return combinedConfig;
}

const is_home = hexo.extend.helper.get('is_home');
const is_category = hexo.extend.helper.get('is_category');
const is_tag = hexo.extend.helper.get('is_tag');
const is_post = hexo.extend.helper.get('is_post');
const is_page = hexo.extend.helper.get('is_page');
const is_archive = hexo.extend.helper.get('is_archive');

const configCache = [];

hexo.extend.filter.register('template_locals', function (locals) {
    let localsCopy = Object.assign({}, locals);

    if(localsCopy.page?.theme) {
        const mode = localsCopy.page.theme.mode === 'replace' ? 'replace' : 'merge';
        if (mode === 'merge') {
            localsCopy.theme = deepMerge(localsCopy.theme, localsCopy.page.theme);
        } else if (mode === 'replace') {
            localsCopy.theme = localsCopy.page.theme;
        }
        localsCopy.theme = themeConfig(localsCopy.theme);
    } else {
        if(configCache.length === 0) {
            configCache.push(themeConfig(localsCopy.theme));
        }
        localsCopy.theme = Object.assign({}, configCache[0]);
    }


    let layout = null;
    if(is_home.call(locals)) {
        layout = 'index';
    } else if(is_category.call(locals) || localsCopy.page.layout === 'category') {
        layout = 'category';
    } else if(is_tag.call(locals) || localsCopy.page.layout === 'tag') {
        layout = 'tag';
    } else if(is_archive.call(locals) || localsCopy.page.layout === 'archive') {
        layout = 'archive';
    } else {
        layout = localsCopy.page.layout;
    }

    for (const field of ['header', 'navigator', 'footer', 'sidebar']) {
        if (layout in localsCopy.theme[field]) {
            localsCopy.theme[field] = localsCopy.theme[field][layout];
        } else {
            localsCopy.theme[field] = localsCopy.theme[field].default;
        }
    }

    hexo.theme.config = localsCopy.theme;
    // console.log(hexo.theme.config);
    return localsCopy;
}, 200);