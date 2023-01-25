
// hexo.extend.injector.register('head_end', function(){
//   if (!hexo.config.theme_config?.plugins?.lazyload?.enable) {
//     return null;
//   }
//   return `
//     <style>
//     .wrapper {
//       position: relative;
//       margin: 2rem auto;
//       overflow: hidden;
//       border-radius: 0.5rem;
//       width: max-content;
//       max-width: 100%;
//     }
//     .wrapper img {
//       position: relative;
//       margin: 0;
//     }
//     .wrapper .ls-blur-up-img {
//       position: absolute;
//       top: 0;
//       left: 0;
//       width: 100%;
//       height: 100%;
//     }
//     img.lazyloading {
//       filter: blur(16px);
//     }
//     img.lazyloaded {
//       filter: blur(0);
//       transition: filter 200ms;
//     }
//     .ls-blur-up-is-loading, img.lazyload:not([src]) {
//       visibility: hidden;
//     }
//     .ls-blur-up-img {
//       position: absolute;
//       top: 0;
//       left: 0;
//       width: 100%;
//       height: 100%;
//       display: block;
//       object-fit: cover;
//       opacity: 1;
//       filter: blur(16px);
//       transition: opacity 200ms, filter 100ms;
//     }
//     .ls-blur-up-img.ls-original-loaded {
//       position: absolute!important;
//       opacity: 0;
//       filter: blur(8px);
//     }
//     .wrapper img.lazyloading {
//       position: absolute;
//       top: 0;
//       left: 0;
//       width: 100%;
//       height: 100%;
//     }
//     .wrapper .ls-blur-up-img.ls-blur-up-loaded {
//       position: relative;
//       width: 100vw;
//     }
//     </style>
//   `;
// }, 'default');
