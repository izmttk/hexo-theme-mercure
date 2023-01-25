const postcss = require('postcss');
const postcssrc = require('postcss-load-config');
const readFile = require('hexo-fs').readFile;
const path = require('path');

async function buildCss(configPath) {
  const { plugins, options } = await postcssrc({
    from : path.resolve(configPath, 'src/css/index.css'),
    to : path.resolve(configPath, 'src/css/index.css'),
  }, configPath);
  const css = await readFile(path.resolve(configPath, options.from));
  const result = await postcss(plugins).process(css, options);
  return result.css;
}

module.exports = buildCss;
