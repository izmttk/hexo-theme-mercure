const { deepMerge } = require('hexo-util');
// https://github.com/hexojs/hexo-util#deepmergetarget-source

const { parseConfig } = require('../../utils/parseConfig');
const is_home = hexo.extend.helper.get('is_home');
const is_category = hexo.extend.helper.get('is_category');
const is_tag = hexo.extend.helper.get('is_tag');
const is_post = hexo.extend.helper.get('is_post');
const is_page = hexo.extend.helper.get('is_page');
const is_archive = hexo.extend.helper.get('is_archive');

hexo.extend.filter.register('template_locals', function (locals) {

  let layout = null;
  if(is_home.call(locals)) {
    layout = 'home';
  } else if(is_category.call(locals)) {
    layout = 'category';
  } else if(is_tag.call(locals)) {
    layout = 'tag';
  } else if(is_archive.call(locals)) {
    layout = 'archive';
  } else {
    layout = locals.page.layout;
  }

  let theme;
  if(locals.page?.theme) {
    // if page itself has theme config, use it
    theme = deepMerge(locals.theme, parseConfig(locals.page.theme));
  } else {
    // only copy theme config
    theme = deepMerge(locals.theme, {});
  }

  // extract layout config
  if ('layout' in theme) {
    if (layout in theme.layout) {
      theme = deepMerge(theme, theme.layout[layout]);
    }
    delete theme.layout;
  }

  // if(locals.page.title === '关于') {
  //     console.log('theme', theme);
  //     console.log('layout', layout);
  //     console.log('locals.page.theme', locals.page.theme);
  // }
  locals.theme = theme;
  return locals;
}, 200);
