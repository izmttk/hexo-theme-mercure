const { deepMerge } = require('hexo-util');
const { isBoolean } = require('../helper/typeof')
let siteConfig = hexo.config;
function themeConfig(config) {
    let THEME_CONFIG = {
        header: headerConfig(config),
        post_card: postCardConfig(config),
        plugins: pluginsConfig(config),
    }
    let configCopy = Object.assign({}, config);
    Object.assign(configCopy, THEME_CONFIG);
    return configCopy;
}

function headerConfig(config) {
    // console.log(config)
    const defaultConfig = {
        enable: config?.header?.enable ?? true,
        height: config?.header?.height ?? '400px',
        bottom_effect: config?.header?.bottom_effect ?? 'none',
    };
    const indexConfig = Object.assign({
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
    }, defaultConfig);
    const postConfig = Object.assign({
        cover: 'full',
    }, defaultConfig);
    const pageConfig = Object.assign({
        cover: 'full',
    }, defaultConfig);
    const archiveConfig = Object.assign({
        cover: 'full',
    }, defaultConfig);
    const categoryConfig = Object.assign({
        cover: 'full',
    }, defaultConfig);
    const tagConfig = Object.assign({
        cover: 'full',
    }, defaultConfig);
    
    let combinedConfig = {
        default: defaultConfig,
        index: deepMerge(indexConfig, config.header?.layout?.index ?? {}),
        post: deepMerge(postConfig, config.header?.layout?.post ?? {}),
        page: deepMerge(pageConfig, config.header?.layout?.page ?? {}),
        archive: deepMerge(archiveConfig, config.header?.layout?.archive ?? {}),
        category: deepMerge(categoryConfig, config.header?.layout?.category ?? {}),
        tag: deepMerge(tagConfig, config.header?.layout?.tag ?? {}),
    }
    for (let key in config?.header?.layout) {
        if (key !== 'index' && key !== 'post' && key !== 'page' &&
            key !== 'archive' && key !== 'category' && key !== 'tag')
        combinedConfig[key] = deepMerge(defaultConfig, config?.header?.layout[key]);
    }
    return combinedConfig;
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
        }
    }
    let configCopy = Object.assign({}, config.plugins);
    for(let key in configCopy) {
        if(isBoolean(configCopy[key])) {
            configCopy[key] = {
                enable: configCopy[key]
            }
        }
    }
    let combinedConfig = deepMerge(defaultConfig, configCopy);
    return combinedConfig;
}
hexo.extend.filter.register('template_locals', function (locals) {
    let localsCopy = Object.assign({}, locals);
    localsCopy.theme = themeConfig(localsCopy.theme);
    hexo.theme.config = localsCopy.theme;
    // console.log(hexo.theme.config);
    return localsCopy;
});