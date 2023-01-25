const { htmlTag } = require('hexo-util');

module.exports = function remixiconHelper(name, attrs) {
  return htmlTag('svg', {
    fill: 'currentColor',
    width: '1em',
    height: '1em',
    ...attrs,
    class: `icon ${attrs?.class ?? ''}`
  }, `<use xlink:href="#${name}"></use>`, false);
}