let siteConfig = hexo.config;

function themeConfig(config) {
    let THEME_CONFIG = {
        header: headerConfig(config),
    }
    Object.assign(config, THEME_CONFIG);
    return config;
}
function headerConfig(config) {
    let header = {
        enable: config.header?.enable,
        height: config.header?.height ?? {
            default: '400px',
        },
        cover: config.header?.cover ?? {
            type: 'normal',
            image: '/assets/defalut-bg.jpg',
        },
        title: config.header?.title ?? siteConfig.title,
        description: config.header?.description ?? {
            type: 'normal',
            content: siteConfig.description,
        },
        scroll_indicator: config.header?.scroll_indicator ?? true,
        bottom_effect: config.header?.bottom_effect ?? 'none'
    }
    if (typeof header.enable !== 'boolean') {
        header.enable = true;
    }
    if (typeof header.height === 'object' && !Array.isArray(header.height)) {
        for (let key in header.height) {
            if (header.height[key] == 'full' || header.height[key] == 'fullscreen')
                header.height[key] = '100vh';
        }
        let height = {
            home: header.height.default,
            post: header.height.default,
            page: header.height.default,
            category: header.height.default,
            tag: header.height.default,
            archive: header.height.default,
        };
        Object.assign(height, header.height);
        header.height = height;
    }
    if (typeof header.height === 'string') {
        header.height = {
            home: header.height,
            post: header.height,
            page: header.height,
            category: header.height,
            tag: header.height,
            archive: header.height,
            default: header.height,
        };
    }
    return header;
}

hexo.extend.filter.register('template_locals', function (locals) {
    let localsCopy = Object.assign({}, locals);
    localsCopy.theme = themeConfig(localsCopy.theme);
    return localsCopy;
});