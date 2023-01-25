const minify = require('html-minifier').minify;

hexo.extend.filter.register('after_render:html', function(str, data) {
  const options = {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    // Ignore '<!-- more -->' https://hexo.io/docs/tag-plugins#Post-Excerpt
    ignoreCustomComments: [/^\s*more/],
    removeComments: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: false,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    minifyJS: true,
    minifyCSS: true
  };
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    return minify(str, options);
  }
  return str;
}, 300);
