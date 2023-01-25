const { readFileSync }  = require('hexo-fs');
const filename = require.resolve('remixicon/fonts/remixicon.symbol.svg');
const cheerio = require('cheerio');
const svgFile = readFileSync(filename);
const svgSelector = cheerio.load(svgFile, {
  xml: true,
}, false);
const availableNames = svgSelector('symbol').map((i, el) => svgSelector(el).attr('id')).toArray();

const remixiconHelper = require('../../utils/remixiconHelper');

hexo.extend.filter.register('after_render:html', function (str, data) {
  const usingNames = [];
  const $ = cheerio.load(str);
  $('svg.icon use[href^="#ri-"]').each((i, el) => {
    const name = $(el).attr('href')?.replace('#', '');
    if(!usingNames.includes(name)) {
      usingNames.push(name);
    }
  })
  $('i[class*="ri-"]').each((i, el) => {
    const name = $(el).attr('class')?.split(' ').find(str => str.startsWith('ri-'));
    const attrs = $(el).removeClass(name).attr();
    $(el).replaceWith(remixiconHelper(name, attrs));
    if(!usingNames.includes(name)) {
      usingNames.push(name);
    }
  })
  const snippet = usingNames.map(name => {
    if (!availableNames.includes(name)) {
      throw new Error(`Icon ${name} does not exist!`);
    }
    const symbol = svgSelector.xml(svgSelector(`symbol#${name}`));
    return symbol;
  }).join('');
  $('body').prepend(`<svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" id="remixicon-symbols" width="0" height="0" style="display:none;">${
    snippet
  }</svg>`);
  return $.html();
})