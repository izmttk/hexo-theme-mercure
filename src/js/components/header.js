import { scrollManager } from '../scroll_manager';
import config from '../configure';
let Parallax = null;
if (config.layout === 'home' && config.header.cover.type === 'parallax') {
  Parallax = (await import('parallax-js')).default;
}

class Header {
  constructor(element = document.querySelector('#header')) {
    this._handleIndicatorClick = this._handleIndicatorClick.bind(this);
    this.init(element);
  }

  init(element = document.querySelector('#header')) {
    this.rootElement = element;
    this._initDescription();
    this._initBackground();
    this.indicatorElement = this.rootElement?.querySelector('.indicator');
    this.indicatorElement?.addEventListener('click', this._handleIndicatorClick);
  }
  _initBackground() {
    if (config.layout === 'home') {
      const backgroundElement = this.rootElement?.querySelector('.background');
      if (config.header.cover.type === 'parallax' && backgroundElement instanceof HTMLElement) {
        this.parallaxIns = new Parallax(backgroundElement, {
          // selector: '.layer',
          relativeInput: true,
          // clipRelativeInput: true,
          hoverOnly: true,
          frictionX: 0.18,
          frictionY: 0.18,
          scalarX: 6,
          scalarY: 6,
          limitX: 50,
          limitY: 50,
        });
      }
      if (config.header.cover.type === 'random' && backgroundElement instanceof HTMLElement) {
        const bg = document.querySelector('#header .cover .background');
        const coverList = [...config.header.cover.image];
        const cover = coverList[Math.floor(Math.random() * coverList.length)];
        backgroundElement.style.backgroundImage = `url(${cover})`;
      }
    }
  }
  _initDescription() {
    if (config.layout === 'home') {
      const descriptionElement = this.rootElement?.querySelector('.description');
      if (descriptionElement instanceof HTMLElement) {
        if (config.header.description.type === 'normal') {
          descriptionElement.innerHTML = `<span>${config.header.description.content}</span>`;
        } else if (config.header.description.type === 'random') {
          const descList = [...config.header.description.content];
          descriptionElement.innerHTML = `<span>${descList[Math.floor(Math.random() * descList.length)]}</span>`;
        } else if (config.header.description.type == 'api') {
          fetch(config.header.description.url)
            .then(res => res.json())
            .then(data => {
              descriptionElement.innerHTML = `
                <span class="hotokoto">
                    <span class="hitokoto-text">${data[config.header.description.text_field]}</span>
                    <span class="hitokoto-author"> —— ${data[config.header.description.from_field]}</span>
                </span>`;
            });
        }
      }
    }
  }

  _handleIndicatorClick(event) {
    if (this.rootElement instanceof HTMLElement) {
      scrollManager.scrollTo(this.rootElement.offsetTop + this.rootElement.offsetHeight);
    }
  }

  async reset(element = document.querySelector('#header')) {
    await this.destroy();
    this.init(element);
  }

  async destroy() {
    this.parallaxIns?.destroy();
    this.indicatorElement?.removeEventListener('click', this._handleIndicatorClick);
    this.rootElement = null;
    this.indicatorElement = null;
  }
}

export default Header;
