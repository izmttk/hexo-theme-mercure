const css = hexo.extend.helper.get('css').bind(hexo);

hexo.extend.generator.register('postcss', async function(locals) {
  if (hexo.theme.config.build?.manual) {
    hexo.extend.injector.register('head_end', () => {
      return css({
        href: 'css/build/style.css',
        media: 'all'
      })
    });
    return;
  }
  const buildCss = require('../../utils/buildCss');
  const cssText = await buildCss(hexo.theme_dir);
  const route = {
    path: 'css/build/style.css',
    data: cssText,
  };
  hexo.extend.injector.register('head_end', () => {
    return css({
      href: route.path,
      media: 'all'
    })
  });
  return route;
});
