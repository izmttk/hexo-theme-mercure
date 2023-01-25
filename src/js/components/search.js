import Modal from './base/modal';
import config from '../configure';

export default class Search {
  constructor() {
    this.rootSelector = '';
    this.inputSelector = '';
    this.initSearchInstance = null;
    if (config.search.provider === 'local') {
      this.rootSelector = '#local-search-panel';
      this.inputSelector = '.local-SearchBox-input';
      this.initSearchInstance = initLocalSearch;
    } else if (config.search.provider === 'algolia') {
      this.rootSelector = '#algolia-search-panel';
      this.inputSelector = '.ais-SearchBox-input';
      this.initSearchInstance = initAlgoliaSearch;
    }
    this.toggleEl = document.querySelector('#search-toggle');
    this.__onToggleClick = this._onToggleClick.bind(this);
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.addEventListener('click', this.__onToggleClick);
    }
    this.init();
  }
  init() {
    this.searchInstance = null;
    const template = document.querySelector('#search-modal-template');
    if (template instanceof HTMLTemplateElement) {
      const el = template.content.querySelector('.modal')?.cloneNode(true);
      if (el instanceof HTMLElement) {
        this.modal = new Modal(el);
      }
    }
  }
  _onToggleClick() {
    this.toggle();
  }
  get isOpened() {
    if (this.modal) {
      return this.modal.isOpened;
    }
    return false;
  }
  async open() {
    if (this.modal) {
      await this.modal.open();
      const el = this.modal.mountedPopover.querySelector(this.rootSelector);
      if (this.initSearchInstance) {
        this.searchInstance = await this.initSearchInstance(el);
      }
      this.modal.mountedPopover.querySelector(this.inputSelector).focus();
    }
  }
  async close() {
    if (this.modal) {
      await this.modal.close();
      this.searchInstance?.destroy();
      this.searchInstance = null;
    }
  }
  async toggle() {
    if (this.modal) {
      if (this.isOpened) {
        await this.close();
      } else {
        await this.open();
      }
    }
  }
  destroy() {
    this.modal?.destroy();
    this.modal = null;
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.removeEventListener('click', this.__onToggleClick);
    }
  }
}

async function initLocalSearch(element) {
  const { localsearch, LocalSearch } = await import('../localsearch');

  const searchClient = localsearch(config.search.path);
  searchClient.configure({
    searchableAttributes: ['title', 'content'],
    attributesToHighlight: ['title', 'content'],
    attributesToSnippet: ['content'],
    attributesToRetrieve: ['title', 'content', 'url'],
  });
  const search = new LocalSearch({
    searchClient,
    placeholder: config.search.placeholder,
    searchAsYouType: config.search.searchAsYouType,
    templates: {
      item: hit => `
        <article>
          <a href="${hit.url}" rel="bookmark">
            <div class="post-thumbnail">
              <svg fill="currentColor" width="1em" height="1em" class="icon"><use xlink:href="#ri-menu-line"></use></svg>
            </div>
            <div class="post-content">
              <h2 class="post-title">${hit.title}</h2>
              <div class="post-excerpt">${hit.content}</div>
            </div>
            <svg fill="currentColor" width="1em" height="1em" class="icon enter-icon"><use xlink:href="#ri-arrow-right-s-line"></use></svg>
          </a>
        </article>`,
      empty: query => `<div>未查找到有关 ${query} 的结果</div>`,
    },
    onQueryChange() {
      const container = element.querySelector('#local-search-result-wrap');
      if (search.isEmptyQuery()) {
        container.style.display = 'none';
      }
    },
    onQuery() {
      const container = element.querySelector('#local-search-result-wrap');
      container.style.display = 'none';
    },
    onResult() {
      const container = element.querySelector('#local-search-result-wrap');
      container.style.display = '';
    }
  });
  search.setSearchBox(element.querySelector('#search-input'));
  search.setSearchResults(element.querySelector('#local-hits'));
  search.setSubmitButton(element.querySelector('.local-SearchBox-submit'));
  search.setResetButton(element.querySelector('.local-SearchBox-reset'));
  search.start();
  return {
    instance: search,
    destroy() {
      search.destroy();
    },
  };
}

async function initAlgoliaSearch(element) {
  const algoliasearch = (await import('algoliasearch/dist/algoliasearch-lite.esm.browser')).default;
  const instantsearch = (await import('instantsearch.js')).default;
  // import configure from 'instantsearch.js/es/widgets/configure/configure';
  // import searchBox from 'instantsearch.js/es/widgets/search-box/search-box';
  // import infiniteHits from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';
  // import poweredBy from 'instantsearch.js/es/widgets/powered-by/powered-by';
  // import hits from 'instantsearch.js/es/widgets/hits/hits';
  // import pagination from 'instantsearch.js/es/widgets/pagination/pagination';
  // import stats from 'instantsearch.js/es/widgets/stats/stats';
  const { configure, searchBox, poweredBy, infiniteHits, hits, pagination, stats } = await import('instantsearch.js/es/widgets');
  

  const algoliaClient = algoliasearch(config.search.appId, config.search.apiKey);
  const searchClient = {
    ...algoliaClient,
    search(requests) {
      if (requests.every(({ params }) => !params.query)) {
        return Promise.resolve({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0,
          })),
        });
      }
      return algoliaClient.search(requests);
    },
  };
  const search = instantsearch({
    indexName: config.search.indexName,
    searchClient,
    searchFunction(helper) {
      const container = element.querySelector('#algolia-search-result-wrap');
      container.style.display = helper.state.query === '' ? 'none' : '';
      helper.search();
    },
  });
  const widgets = [];
  if (config.search.configure.enable) {
    const { enable, ...options } = config.search.configure;
    const widget = configure({
      // attributesToSnippet: ['*'],
      // attributesToHighlight: ['*'],
      // snippetEllipsisText: '...',
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.searchBox.enable) {
    const { enable, ...options } = config.search.searchBox;
    const widget = searchBox({
      container: element.querySelector('#algolia-searchbox'),
      placeholder: config.search.searchBox.placeholder,
      autofocus: false,
      searchAsYouType: config.search.searchBox.searchAsYouType,
      showReset: true,
      showSubmit: true,
      showLoadingIndicator: true,
      templates: {
        submit({ cssClasses }, { html }) {
          return html`<svg fill="currentColor" width="1em" height="1em" class="icon ${cssClasses.submit}"><use xlink:href="#ri-search-line"></use></svg>`;
        },
        reset({ cssClasses }, { html }) {
          return html`<svg fill="currentColor" width="1em" height="1em" class="icon ${cssClasses.resetIcon}"><use xlink:href="#ri-close-circle-fill"></use></svg>`;
        },
        loadingIndicator({ cssClasses }, { html }) {
          return html`<svg fill="currentColor" width="1em" height="1em" class="icon ${cssClasses.loadingIcon}"><use xlink:href="#ri-loader-4-line"></use></svg>`;
        }
      },
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.poweredBy.enable) {
    const { enable, ...options } = config.search.poweredBy;
    const widget = poweredBy({
      container: element.querySelector('#algolia-poweredby'),
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.infiniteHits.enable || config.search.hits.enable) {
    const hitOptions = {
      container: element.querySelector('#algolia-hits'),
      transformItems(items) {
        return items.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString(),
          hasThumbnail: item.thumbnail != null,
        }));
      },
      templates: {
        showMoreText() { return '加载更多'; },
        empty(result, { html }) {
          if (result.query) {
            return html`<div>未查找到有关 ${result.query} 的结果</div>`;
          }
          return html`<div>搜索中</div>`;
        },
        item(hit, { html, components }) {
          return html`
            <article>
              <a href="${hit.permalink}" rel="bookmark">
                <div class="post-thumbnail">
                  ${
                    hit.thumbnail 
                    ? html`<img src="${hit.thumbnail}"/>`
                    : html`<svg fill="currentColor" width="1em" height="1em" class="icon"><use xlink:href="#ri-menu-line"></use></svg>`
                  }
                </div>
                <div class="post-content">
                  <div class="post-date">${hit.date}</div>
                  <h2 class="post-title">${components.Highlight({ hit, attribute: 'title' })}</h2>
                  <div class="post-excerpt">${components.Snippet({ hit, attribute: 'content' })}</div>
                </div>
                <svg fill="currentColor" width="1em" height="1em" class="icon enter-icon"><use xlink:href="#ri-arrow-right-s-line"></use></svg>
              </a>
            </article>`;
        }
      },
    };
    if (config.search.infiniteHits.enable) {
      const { enable, ...options } = config.search.infiniteHits;
      const widget = infiniteHits({
        ...hitOptions,
        ...options
      });
      widgets.push(widget);
    }
    if (config.search.hits.enable) {
      const { enable, ...options } = config.search.hits;
      const widget = hits({
        ...hitOptions,
        ...options
      });
      widgets.push(widget);
    }
  }
  if (config.search.stats.enable) {
    const { enable, ...options } = config.search.stats;
    const widget = stats({
      container: element.querySelector('#algolia-stats'),
      templates: {
        text(state, { html }) {
          return html`<span role="img" aria-label="emoji">⚡️</span><strong>${state.nbHits}</strong> results found ${ state.query ? html`for <strong>"${state.query}"</strong>` : '' } in <strong>${state.processingTimeMS}ms</strong>`;
        }
      },
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.pagination.enable) {
    const { enable, ...options } = config.search.pagination;
    const widget = pagination({
      container: element.querySelector('#algolia-pagination'),
      ...options
    });
    widgets.push(widget);
  }
  search.addWidgets(widgets);
  search.start();
  return {
    instance: search,
    destory() {
      search.removeWidgets(widgets);
      search.dispose();
    },
  };
}
