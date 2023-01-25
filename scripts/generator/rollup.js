const js = hexo.extend.helper.get('js').bind(hexo);

hexo.extend.generator.register('rollup', async function(locals) {
  if (hexo.theme.config.build?.manual) {
    hexo.extend.injector.register('body_end', () => {
      return js({
        src: 'js/build/index.js',
        type: 'module',
      });
    });
    return;
  }
  const buildJs = require('../../utils/buildJs');
  const outputs =  await buildJs(hexo.theme_dir);
  const routes = [];
  for (const output of outputs) {
    const route = {
      path: 'js/build/' + output.fileName,
      data: output.type === 'asset' ? output.source : output.code,
    };
    routes.push(route);
    if (output.isEntry) {
      hexo.extend.injector.register('body_end', () => {
        return js({
          src: route.path,
          type: 'module',
        });
      });
    }
  }
  return routes;
});
