const cheerio = require('cheerio');
const { slugize } = require('hexo-util');

hexo.extend.filter.register('after_post_render', function(data) {
  const theme = hexo.theme.config;
  if (!theme.plugins.anchor.enable) return;

  const $ = cheerio.load(data.content, { decodeEntities: false });
  const headings = $('h1, h2, h3, h4, h5, h6');

  headings.each(function (index, element) {
    const id = slugize($(element).text());
    $(element).attr('id', encodeURI(id));
  });

  data.content = $('body').html();
}, 200);
