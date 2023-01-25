const { parseConfig, mergeDefault } = require('../../../utils/parseConfig');

function setThemeConfig(hexo) {
  const themeConfig = mergeDefault(hexo.config.theme_config);
  // console.log('themeConfig', themeConfig);
  hexo.config.theme_config = themeConfig;
}

module.exports = setThemeConfig;
// for (const section of multiLayoutSections) {
//     if (hasProperty(section, hexo.config.theme_config)) {
//         console.log('layout section', section);
//     }
// }

// for (const section of switchableOptions) {
//     if (hasProperty(section, hexo.config.theme_config)) {
//         console.log('switch section', section);
//     }
// }

// const o = {};
// setProperty('test.asd', 'test', o)
// console.log(o);

// const themeConfig = parseConfig({
//     sidebar: {
//         profile: true,
//         tag_cloud: true,
//     },
//     layout: {
//         home: {
//             sidebar: {
//                 enable: false,
//             },
//         }
//     },
// });
// console.log('themeConfig', themeConfig);
