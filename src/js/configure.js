const config = {};

const get = () => {
  const configText = document.querySelector('#config-data')?.textContent;
  if (configText) {
    return JSON.parse(configText);
  } else {
    return {};
  }
};

const clear = () => {
  for (const key in config) {
    delete config[key];
  }
};

const assign = newConfig => {
  clear();
  Object.assign(config, newConfig);
  return config;
};

const update = () => {
  const newConfig = get();
  return assign(newConfig);
};

const clone = () => {
  // deep clone config object and return
  return JSON.parse(JSON.stringify(config));
};

export default config;

export { get, clear, assign, update, clone };
update();
