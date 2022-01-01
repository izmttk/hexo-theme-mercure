// const postcss = require('postcss');
// const postcssrc = require('postcss-load-config');
// const path = require('path')
// const fs = require('hexo-fs')

// const entry = path.join(hexo.theme_dir, 'style/style.css');

// hexo.extend.generator.register('postcss', function(locals) {
//     process.chdir(hexo.theme_dir)
//     return postcssrc({}, hexo.theme_dir)
//     .then(({ plugins, options }) => {
//         options = Object.assign({
//             from: entry
//         }, options);
//         return fs.readFile(entry).then(css => {
//             return postcss(plugins).process(css, options);
//         });
//     }).then(result => {
//         route = [{
//             path: 'css/style.css',
//             data: result.css
//         }];
//         if(result.map) {
//             route.push({
//                 path: 'css/style.css.map',
//                 data: result.map
//             })
//         }
//         return route;
//     });
// });
