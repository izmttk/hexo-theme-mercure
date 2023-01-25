import { applyAnimation, applyTransition, yieldToMain } from './utils';
import config, { clone as cloneConfig, update as updateConfig } from './configure';
import colorMode from './color_mode';

import Navigator from './components/navigator';
import Loading from './components/loading';
import Fabs from './components/fabs';
import Tooltip from './components/base/tooltip';
import Header from './components/header';
import Sidebar from './components/sidebar';
// import { polyfill } from 'seamless-scroll-polyfill';
// polyfill({forcePolyfill: true});

import { anchorManager } from './anchor_manager';
import { scrollManager } from './scroll_manager';

// package pjax@0.2.8 do not respect script tag's type attribute when html be inserted into DOM
// package @next-theme/pjax@0.6.0 do not execute script tag totally
// use https://github.com/PaperStrike/Pjax/
// import Pjax from '@sliphua/pjax';

import Swup from 'swup';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupSlideTheme from '@swup/slide-theme';
import SwupDebugPlugin from '@swup/debug-plugin';


console.log('dev mode');

if (config.lazyload.enable) {
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.expand = 400;
}

colorMode.set(config.colormode ?? 'auto');
colorMode.autoChange();

let loading =  config.loading.enable ? new Loading(null, {
  defaultOpen: true,
}) : null;

// script before this line will be executed before DOMContentLoaded
await yieldToMain();

let header = config.header.enable ? new Header() : null;
await yieldToMain();

let navigator = config.navigator.enable ? new Navigator() : null;
await yieldToMain();

let sidebar = config.sidebar.enable ? new Sidebar() : null;
await yieldToMain();

let fabs = new Fabs();
await yieldToMain();

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    event => {
      loading?.hide();
    },
    { once: true }
  );
} else {
  loading?.hide();
}

const scrollMarginTop = 76;
const scrollIntoView = (hash, marginTop = 0, immediate = false) => {
  const id = decodeURI(hash); //decodeURI(this.getAttribute('href'));
  const target = document.querySelector(id);
  if (target instanceof HTMLElement) {
    scrollManager.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - marginTop, immediate);
  }
};
window.addEventListener('hashchange', event => {
  const hash = document.location.hash;
  if (hash) {
    scrollIntoView(hash, scrollMarginTop);
  }
});
document.addEventListener(
  'DOMContentLoaded',
  event => {
    const hash = document.location.hash;
    if (hash) {
      scrollIntoView(hash, scrollMarginTop, true);
    }
  },
  { once: true }
);
anchorManager.register('hash', (event, target) => {
  const anchor = target;
  if (
    anchor.origin === document.location.origin &&
    anchor.pathname === document.location.pathname &&
    anchor.hash !== document.location.hash
  ) {
    window.history.pushState(null, '', anchor.hash);
    // pushState will not trigger hashchange event
    scrollIntoView(anchor.hash, scrollMarginTop);
    event.preventDefault();
  }
  if (anchor.pathname === document.location.pathname && anchor.hash === document.location.hash && anchor.hash !== '') {
    scrollIntoView(anchor.hash, scrollMarginTop);
    event.preventDefault();
  }
});

let renderMathInElement = null;

const renderMath = () => {
  if (renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    });
  }
};

if (config.katex.enable) {
  renderMathInElement = (await import('katex/dist/contrib/auto-render.mjs')).default;
  // dynamic import katex to shrink bundle size
  renderMath();
}

if (config.pjax.enable) {
  // const pjaxSelectors = [
  //   'title',
  //   'meta[name=description]',
  //   '#config-data',
  //   '#remixicon-symbols',
  //   '#header',
  //   '#footer',
  //   '#main',
  //   '.nav-right-drawer',
  //   '.fabs',
  // ];
  // const pjax = new Pjax({
  //   defaultTrigger: false,
  //   selectors: pjaxSelectors,
  //   scrollTo: false,
  // });
  const pjaxSelectors = [
    '#remixicon-symbols',
    '#header',
    '#footer',
    '#main',
    '.nav-right-drawer',
    '.fabs',
  ];
  const animeSelector = '#main';
  const swup = new Swup({
    linkSelector: false,
    animationSelector: animeSelector,
    containers: pjaxSelectors,
    plugins: [
      new SwupScriptsPlugin(),
      new SwupHeadPlugin(),
      new SwupSlideTheme({
        mainElement: animeSelector,
      }),
      new SwupDebugPlugin()
    ]
  });


  let prevLocation = null;
  let prevLocationUpdate = null;
  // document.addEventListener('pjax:send', async () => {
  swup.on('transitionStart', async () => {
    loading?.show();
  });
  swup.on('willReplaceContent', async () => {
    prevLocationUpdate = document.location.href;
  });

  // });
  // document.addEventListener('pjax:success', async () => {
  swup.on('contentReplaced', async () => {

    prevLocation = prevLocationUpdate;
    const oldConfig = cloneConfig();
    const newConfig = updateConfig();

    // console.log(oldConfig, newConfig);

    const updateMap = {
      header: [Header, header],
      navigator: [Navigator, navigator],
      sidebar: [Sidebar, sidebar],
      fabs: [Fabs, fabs],
    };
    [header, navigator, sidebar, fabs] = await Promise.all(Object.keys(updateMap).map(async (key) => {
      const [Component, instance] = updateMap[key];
      if (!oldConfig[key].enable && newConfig[key].enable) {
        return new Component();
      } else if (oldConfig[key].enable && !newConfig[key].enable) {
        await instance?.destroy();
        return null;
      } else if (oldConfig[key].enable && newConfig[key].enable) {
        await instance?.reset();
        return instance;
      }
      return instance;
    }))

    loading?.hide();
    newConfig.katex.enable && renderMath();
    // document.querySelectorAll('#header,#main,#footer').forEach(e => {
    //   applyTransition(e, {
    //     transition: 'transform .4s ease-out, opacity .4s ease-out',
    //     from: {
    //       transform: 'translateY(-100px)',
    //       opacity: 0,
    //     },
    //     to: {
    //       transform: 'translateY(0)',
    //       opacity: 1,
    //     },
    //     keep: false,
    //   });
    // })

    // applyAnimation(document.querySelector('#header'), {
    //   className: 'slide-down-fade-in',
    // });
    // applyAnimation(document.querySelector('#main'), {
    //   className: 'slide-up-fade-in',
    // });
    scrollManager.scrollTo(0, 0, true);

    if (newConfig.layout === '404') {
      document.querySelector('.goback')?.addEventListener('click', () => {
        // pjax.load(prevLocation);
        swup.loadPage({
          url: prevLocation,
        })
      })
    }
  });
  // });

  // 对所有 a[href] 绑定 click 事件，此后 DOM 新增的 a[href] 也会自动监听
  // 只有站内跳转才会用到 pjax ，注意要取消事件的默认行为
  anchorManager.register('pjax', (event, target) => {
    const anchor = target;
    // 若网站只有hash部分改变，则不跳转
    if (anchor.origin === document.location.origin) {
      if (
        anchor.pathname !== document.location.pathname ||
        (anchor.pathname === document.location.pathname && anchor.hash === '' && document.location.hash === '')
      ) {
        event.preventDefault();
        // pjax.load(anchor.href);
        swup.loadPage({
          url: anchor.href,
        })
      }
    }
  });
}
