const { isBoolean } = require('./is');
const { deepMerge } = require('hexo-util');
const defaultConfig = require('./defaultConfig');

const switchableOptions = [
  'header',
  'navigator',
  'navigator.toolkit.search',
  'navigator.toolkit.colormode',
  'sidebar',
  'sidebar.profile',
  'sidebar.stats',
  'sidebar.tag_cloud',
  'sidebar.category_tree',
  'sidebar.toc',
  'fabs',
  'fabs.goto_top',
  'fabs.goto_comment',
  'footer',
  'search',
  'search.local_search',
  'search.algolia_search',
  'loading',
  'comments',
  'comments.gitalk',
  'comments.giscus',
  'comments.twikoo',
  'comments.disqus',
  'comments.disqusjs',
  'plugins.katex',
  'plugins.anchor',
  'plugins.lazyload',
  'plugins.pjax',
  'plugins.overlay_scrollbar',
];

const multiLayoutSections = [
  'header',
  'navigator',
  'sidebar',
  'fabs',
  'footer',
  'loading',
];



function hasProperty(property, object) {
  const properties = property.split('.');
  let currentObject = object;
  for (const key of properties) {
    if (currentObject[key] === undefined) {
      return false;
    }
    currentObject = currentObject[key];
  }
  return true;
}

function setProperty(property, value, object) {
  const properties = property.split('.');
  let currentObject = object;
  let lastObject = object;
  for (const key of properties) {
    if (currentObject[key] === undefined) {
      currentObject[key] = {};
    }
    lastObject = currentObject;
    currentObject = currentObject[key];
  }
  lastObject[properties[properties.length - 1]] = value;
}

function getProperty(property, object) {
  const properties = property.split('.');
  let currentObject = object;
  for (const key of properties) {
    if (currentObject[key] === undefined) {
      return undefined;
    }
    currentObject = currentObject[key];
  }
  return currentObject;
}

function isPrefix(property, prefix) {
  const properties = property.split('.');
  const prefixProperties = prefix.split('.');
  if (properties.length < prefixProperties.length) {
    return false;
  }
  for (let i = 0; i < prefixProperties.length; i++) {
    if (properties[i] !== prefixProperties[i]) {
      return false;
    }
  }
  return true;
}

// build section config with enable property
function parseSection(section) {
  let sectionCopy = deepMerge(section, {});
  if (isBoolean(section)) {
    sectionCopy = {
      enable: section,
    };
  } else {
    sectionCopy = {
      ...section,
      enable: section.enable ?? true,
    };
  }
  return sectionCopy;
}

function parseConfig(config) {
  let configCopy = deepMerge(config, {});
  // console.log(configCopy);
  for (const property of switchableOptions) {
    if (hasProperty(property, configCopy)) {
      setProperty(property, parseSection(getProperty(property, configCopy)), configCopy);
    }
  }

  const commonConfig = deepMerge(configCopy, {});
  const layoutConfig = deepMerge(configCopy.layout, {});
  delete commonConfig.layout;

  if (hasProperty('layout', configCopy)) {
    for (const layout of Object.keys(layoutConfig)) {
      for (const property of multiLayoutSections) {
        if (hasProperty(`${layout}.${property}`, layoutConfig)) {
          setProperty(`${layout}.${property}`, parseSection(getProperty(`${layout}.${property}`, configCopy.layout)), configCopy.layout);
        }
      }
      const newConfig = deepMerge(commonConfig, configCopy.layout[layout]);
      setProperty(layout, newConfig, configCopy.layout);
    }
  }
  return configCopy;
}

function mergeDefault(config) {
  return deepMerge(defaultConfig, parseConfig(config));
}

module.exports = {
  hasProperty,
  setProperty,
  getProperty,
  parseConfig,
  mergeDefault,
  switchableOptions,
  multiLayoutSections,
};
