const url_for = require('hexo-util').url_for.bind(hexo);

// 为封面的链接地址单独设置thumbnail字段
// 通常用于搜索引擎的缩略图
hexo.extend.filter.register('before_post_render', function(data) {
  const getPageCover = hexo.extend.helper.get('getPageCover').bind(hexo);
  const cover = getPageCover(data.cover);
  data.cover = cover;
  if(data.layout == 'post') {
    if(cover.path) {
      data.thumbnail = url_for(cover.path);
    } else {
      data.thumbnail = null;
    }
    if(data.path) {
      data.absolute_path = url_for(data.path);
    }
  }
  return data;
}, 200);
