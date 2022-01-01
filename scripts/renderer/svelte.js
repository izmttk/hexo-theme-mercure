// require('svelte/register')({
//     hydratable: true,
// });;

// function renderer(data, locals) {
//     const app = require(data.path).default;
//     const { head, html, css } = app.render({}, {
//         context: new Map([['locals', locals]])
//     });
//     return html;
// }
// renderer.compile = function(data) {
//     return function(locals) {
//         const app = require(data.path).default;
//         const { head, html, css } = app.render({}, {
//             context: new Map([['locals', locals]])
//         });
//         return html;
//     }
// };
// hexo.extend.renderer.register('svelte', 'html', renderer);
