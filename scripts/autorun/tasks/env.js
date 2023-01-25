function setEnv(hexo) {
  if (hexo.config.theme_config.build?.env) {
    process.env.NODE_ENV = hexo.config.theme_config.build.env;
  } else {
    if (hexo.env.cmd === 'server' || hexo.env.cmd === 's') {
      // set the NODE_ENV to development
      process.env.NODE_ENV = 'development';
    } else {
      // set the NODE_ENV to production
      process.env.NODE_ENV = 'production';
    }
  }
}

module.exports = setEnv;
