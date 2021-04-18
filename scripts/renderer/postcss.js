const postcss = require('postcss');
const postcssrc = require('postcss-load-config');
// console.log(hexo)
process.chdir(hexo.theme_dir)
process.env.NODE_ENV = 'production'
hexo.extend.renderer.register('pcss', 'css', data => {
    let ctx = {}
    return postcssrc(ctx, hexo.theme_dir).then(({ plugins, options }) => {
        options = Object.assign({
            from: data.path
        }, options);
        return postcss(plugins).process(data.text, options).then(result => {
            return result.css;
        })
    })
})