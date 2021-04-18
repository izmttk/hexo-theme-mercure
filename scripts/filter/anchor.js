const cheerio = require("cheerio");
const { slugize } = require('hexo-util');

hexo.extend.filter.register('after_post_render', data => {
  const theme = hexo.theme.config;
  if (!theme.plugins.anchor) return;

  const $ = cheerio.load(data.content, { decodeEntities: false });
  const headings = $('h1, h2, h3, h4, h5, h6');

  headings.each(function (index, element) {
    let id = slugize($(element).text());
    $(element).attr('id', encodeURI(id));
  });

  data.content = $.html();
});