import config from './configure';

let colorMode = config.colormode ?? 'auto';

const set = mode => {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.remove('light');
  if (mode === 'auto') {
    colorMode = mode;
    if (getScheme() === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } else if (mode === 'dark') {
    colorMode = mode;
    document.documentElement.classList.add('dark');
  } else if (mode === 'light') {
    colorMode = mode;
  }
};

const get = () => {
  return colorMode;
};

// auto --> light --> dark --> auto
const toggle = () => {
  if (colorMode === 'auto') {
    return set('light');
  } else if (colorMode === 'light') {
    return set('dark');
  } else if (colorMode === 'dark') {
    return set('auto');
  }
};

const getScheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const autoChange = () => {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (colorMode === 'auto') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
};

export default {
  set,
  get,
  toggle,
  getScheme,
  autoChange,
};
