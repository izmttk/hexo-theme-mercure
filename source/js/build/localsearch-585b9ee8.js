/**
 * @typedef {Object} SearchClientOptions
 * @property {string} path Path to request site data
 * @property {boolean} cache Cache search results
 * @property {RequestInit} requestOptions request options
 * @property {SearchOptions} searchOptions search headers
 */

/**
 * @typedef {Object} SearchOptions
 * @property {string[]} searchableAttributes attributes to search
 * @property {string[]} attributesToHighlight attributes to highlight
 * @property {string} highlightPreTag tag added before highlighted text
 * @property {string} highlightPostTag tag added after highlighted text
 * @property {string[]} attributesToSnippet attributes to snippet
 * @property {string} snippetEllipsisText ellipsis text around snippet
 * @property {string[]} attributesToRetrieve attributes that will be within the answer
 */

/**
 * @typedef {Object} Hits
 * @typedef {Object} ResponseItem
 */

/**
 * @author Wider Gao
 * @copyright Copyright (c) 2022
 * @class SearchClient
 */
class SearchClient {
  /**
   * default search options
   * @type {SearchClientOptions}
   * @static
   */
  static defaultOptions = {
    path: '/search.json',
    cache: true,
    requestOptions: {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      redirect: 'follow',
    },
    searchOptions: {
      searchableAttributes: [],
      attributesToHighlight: [],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      attributesToSnippet: [],
      snippetEllipsisText: '…',
      attributesToRetrieve: [],
    },
  };
  /**
   * Creates an instance of SearchClient.
   * @param {Partial<SearchClientOptions>} [options = {}] SearchClient options
   * @memberof SearchClient
   */
  constructor(options = {}) {
    const combinedOptions = { ...SearchClient.defaultOptions, ...options };
    combinedOptions.requestOptions = { ...SearchClient.defaultOptions.requestOptions, ...options.requestOptions };
    combinedOptions.searchOptions = { ...SearchClient.defaultOptions.searchOptions, ...options.searchOptions };
    /**
     * path Path to request site data
     * @type {string}
     */
    this.path = combinedOptions.path;
    /**
     * cache whether has cached search results
     * @type {boolean}
     */
    this.cache = combinedOptions.cache;
    /**
     * esponsesCache cached search results
     * @type {object|null}
     */
    this.responsesCache = null;
    if (combinedOptions.cache) {
      this.responsesCache = this.createInMemoryCache();
    }
    /**
     * request request instance
     * @type {Request}
     */
    this.request = new Request(combinedOptions.path, combinedOptions.requestOptions);
    this.searchOptions = combinedOptions.searchOptions;
  }
  /**
   * Setup searchOptions separately
   * @param {Partial<SearchOptions>} [options={}] params for search options
   * @memberof SearchClient
   */
  configure(options = this.searchOptions) {
    this.searchOptions = { ...this.searchOptions, ...options };
  }
  /**
   * Search query and return results
   * @param {string} query Query to search
   * @param {Partial<SearchOptions>} [options=this.searchOptions] Separate params for search options
   * @return {Promise<Hits>} Return hits array of search results
   * @memberof SearchClient
   */
  search(query, options = this.searchOptions) {
    const combinedOptions = { ...this.searchOptions, ...options };
    return this.fetchSource().then(data => {
      if (!Array.isArray(data)) {
        data = Array.from(data);
      }
      return data.map(item => this.handleItem(item, query, combinedOptions)).filter(item => item !== null);
    });
  }
  /**
   * Handle single item, return null if item is not matched
   * @param {ResponseItem} item Item to handle
   * @param {string} [query=''] Query to search
   * @param {Partial<SearchOptions>} [options=this.searchOptions] Separate params for search options
   * @return {ResponseItem|null} Return processed item
   * @memberof SearchClient
   */
  handleItem(item, query = '', options = this.searchOptions) {
    const combinedOptions = { ...this.searchOptions, ...options };

    const keywords = query.trim().toLowerCase().split(/\s/);
    const regex = new RegExp(keywords.join('|'), 'gi');
    const hit = {};
    let hitted = false;
    combinedOptions.attributesToRetrieve.forEach(attribute => {
      if (!(attribute in item)) {
        item[attribute] = '';
      }
      let attrValue = item[attribute].trim().toLowerCase();
      if (combinedOptions.searchableAttributes.includes(attribute)) {
        const match = regex.exec(attrValue);
        hitted = match !== null;
        if (combinedOptions.attributesToSnippet.includes(attribute)) {
          const startIndex = match ? match.index : 0;
          const endIndex = Math.max(startIndex - 10, 0) + 36;
          let snippet = attrValue.substring(startIndex, endIndex);
          if (startIndex > 0) {
            snippet = combinedOptions.snippetEllipsisText + snippet;
          }
          if (endIndex < attrValue.length - 1) {
            snippet = snippet + combinedOptions.snippetEllipsisText;
          }
          attrValue = snippet;
        }
        if (combinedOptions.attributesToHighlight.includes(attribute)) {
          attrValue = attrValue.replace(regex, match => {
            return combinedOptions.highlightPreTag + match + combinedOptions.highlightPostTag;
          });
        }
      }
      hit[attribute] = attrValue;
    });
    return hitted ? hit : null;
  }
  /**
   * Create in-memory cache
   * @param {Object} [options={ serializable: true }] Options for cache
   * @return {Object} InMemoryCache instance
   * @memberof SearchClient
   */
  createInMemoryCache(
    options = {
      serializable: true,
    }
  ) {
    let cache = {};
    return {
      get(key) {
        const keyAsString = JSON.stringify(key);
        if (keyAsString in cache) {
          return Promise.resolve(options.serializable ? JSON.parse(cache[keyAsString]) : cache[keyAsString]);
        }
        return Promise.resolve(null);
      },
      set(key, value) {
        cache[JSON.stringify(key)] = options.serializable ? JSON.stringify(value) : value;
        return Promise.resolve(value);
      },
      delete(key) {
        delete cache[JSON.stringify(key)];
        return Promise.resolve();
      },
      clear() {
        cache = {};
        return Promise.resolve();
      },
    };
  }
  /**
   * Fetch source data from server
   * if cache is enabled, store the first response in cache and return cached data
   * @return {Promise<*>} Promise resolved with cached data or server response
   * @memberof SearchClient
   */
  fetchSource() {
    if (this.cache) {
      return this.responsesCache.get(this.request).then(cache => {
        if (cache == null) {
          return fetch(this.request)
            .then(response => response.json())
            .then(data => {
              this.responsesCache.set(this.request, data);
              return data;
            });
        } else {
          return cache;
        }
      });
    } else {
      return fetch(this.request).then(response => response.json());
    }
  }
  /**
   * Clear cache
   * @return {Promise<void>} Promise resolved when cache is cleared
   * @memberof SearchClient
   */
  clearCache() {
    if (this.cache) {
      return this.responsesCache.clear();
    } else {
      return Promise.resolve();
    }
  }
  /**
   * Clear cache and fetch source data from server
   * @return {Promise<void>} Promise resolved with data is cleared
   * @memberof SearchClient
   */
  destroy() {
    return this.responsesCache.clear().then(() => {
      this.responsesCache = null;
    });
  }
}
/**
 * Factory function to create SearchClient instance
 * @param {string} path Path to request site data
 * @param {Partial<SearchClientOptions>} [options={}] SearchClient options
 * @return {SearchClient} SearchClient instance
 */
const localsearch = function (path, options = {}) {
  const defaultOptions = {
    path,
    cache: true,
  };
  const searchClientOptions = { ...defaultOptions, ...options };
  return new SearchClient(searchClientOptions);
};

/**
 * @typedef {Object} LocalSearchOptions
 * @property {SearchClient|null} searchClient attributes to search
 * @property {string} placeholder attributes to highlight
 * @property {boolean} searchAsYouType tag added before highlighted text
 * @property {{
 *   item: function(ResponseItem): string,
 *   empty: function(string): string
 * }} templates tag added after highlighted text
 * @property {function(string): void} [onQueryChange]
 * @property {function(string): void} [onQuery]
 * @property {function(Hits): void} [onResult]
 */

/**
 * @author Wider Gao
 * @copyright Copyright (c) 2022
 * @class LocalSearch
 */
class LocalSearch {
  /**
   * @type {HTMLInputElement|null}
   * @memberof LocalSearch
   */
  searchBox = null;
  /**
   * @type {HTMLElement|null}
   * @memberof LocalSearch
   */
  searchResults = null;
  /**
   * @type {HTMLElement|null}
   * @memberof LocalSearch
   */
  submitButton = null;
  /**
   * @type {HTMLElement|null}
   * @memberof LocalSearch
   */
  resetButton = null;
  /**
   *
   * @type {LocalSearchOptions}
   * @static
   * @memberof LocalSearch
   */
  static defaultOptions = {
    searchClient: null,
    placeholder: 'Search for...',
    searchAsYouType: false,
    templates: {
      item: (/** @type {ResponseItem} */ hit) => `${hit.title}`,
      empty: (/** @type {string} */ query) => `No results found for "${query}"`,
    },
  };
  /**
   * Creates an instance of LocalSearch.
   * @param {LocalSearchOptions} options
   * @memberof LocalSearch
   */
  constructor(options) {
    options.templates = { ...LocalSearch.defaultOptions.templates, ...options.templates };
    options = { ...LocalSearch.defaultOptions, ...options };
    this.searchClient = options.searchClient;
    this.placeholder = options.placeholder;
    this.searchAsYouType = options.searchAsYouType;
    this.templates = options.templates;
    this.hooks = {
      onQueryChange: options.onQueryChange,
      onQuery: options.onQuery,
      onResult: options.onResult
    };
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onClickReset = this.onClickReset.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
  }
  /**
   * set search input element
   * @param {HTMLInputElement|string} element
   * @memberof LocalSearch
   */
  setSearchBox(element) {
    if (element instanceof HTMLInputElement) {
      this.searchBox = element;
    } else if (typeof element === 'string') {
      this.searchBox = document.querySelector(element);
    }
  }
  /**
   * set submit button element
   * @param {HTMLElement|string} element
   * @memberof LocalSearch
   */
  setSubmitButton(element) {
    this.submitButton = typeof element === 'string' ? document.querySelector(element) : element;
  }
  /**
   * set reset button element
   * @param {HTMLElement|string} element
   * @memberof LocalSearch
   */
  setResetButton(element) {
    this.resetButton = typeof element === 'string' ? document.querySelector(element) : element;
  }
  /**
   * set search results container element
   * @param {HTMLElement|string} element
   * @memberof LocalSearch
   */
  setSearchResults(element) {
    this.searchResults = typeof element === 'string' ? document.querySelector(element) : element;
  }
  /**
   * process element initalization and bind event listeners
   * @memberof LocalSearch
   */
  start() {
    this.bindEvents();
    this.searchBox?.dispatchEvent(new Event('input'));
    if (this.searchBox !== null) {
      this.searchBox.placeholder = this.placeholder;
    }
  }
  /**
   * clear and hide search results constainer
   * @memberof LocalSearch
   */
  clearResults() {
    if (this.searchResults !== null) {
      this.searchResults.innerHTML = '';
    }
  }
  /**
   * update search results container using query from input
   * @memberof LocalSearch
   */
  updateResults() {
    this.clearResults();
    if (this.isEmptyQuery()) return;
    const query = this.getQuery();
    Promise.resolve()
      .then(() => {
        /** @type {Promise<Hits>} */
        let result  = Promise.resolve([]);
        if (!this.isEmptyQuery() && this.searchClient) {
          result = this.searchClient.search(query);
        }
        if (this.hooks.onQuery) {
          this.hooks.onQuery(this.getQuery());
        }
        return result;
      })
      .then(results => {
        if (results.length > 0) {
          const listElement = document.createElement('ol');
          listElement.classList.add('local-Hits-list');
          results.forEach(result => {
            const resultElement = document.createElement('li');
            resultElement.classList.add('local-Hits-item');
            resultElement.innerHTML = this.templates.item(result);
            listElement.appendChild(resultElement);
          });
          this.searchResults?.appendChild(listElement);
        } else {
          if (this.searchResults !== null) {
            this.searchResults.innerHTML = this.templates.empty(query);
          }
        }
        if (this.hooks.onResult) {
          this.hooks.onResult(results);
        }
      });
  }
  /**
   * get value from search input
   * @return {string}
   * @memberof LocalSearch
   */
  getQuery() {
    if (this.searchBox !== null) {
      return this.searchBox.value;
    }
    return '';
  }
  /**
   * clear search input
   * @memberof LocalSearch
   */
  clearQuery() {
    if (this.searchBox !== null) {
      this.searchBox.value = '';
    }
    if (this.hooks.onQueryChange) {
      this.hooks.onQueryChange(this.getQuery());
    }
  }
  /**
   * check if search input is empty
   * @return {boolean} search input is empty or not
   * @memberof LocalSearch
   */
  isEmptyQuery() {
    return this.getQuery().trim().length === 0;
  }
  /**
   * bind events for elements
   * @memberof LocalSearch
   */
  bindEvents() {
    this.searchBox && this.searchBox.addEventListener('keydown', this.onKeyDown);
    this.searchBox && this.searchBox.addEventListener('input', this.onQueryChange);
    this.submitButton && this.submitButton.addEventListener('click', this.onClickSubmit);
    this.resetButton && this.resetButton.addEventListener('click', this.onClickReset);
  }
  /**
   * handle event of pressing enter key
   * @param {KeyboardEvent} event
   * @memberof LocalSearch
   */
  onKeyDown(event) {
    // when enter key is pressed
    if (event.key === 'Enter') {
      this.updateResults();
    }
  }
  /**
   * handle event of clicking submit button
   * @param {Event} event
   * @memberof LocalSearch
   */
  onClickSubmit(event) {
    this.updateResults();
  }
  /**
   * handle event of clicking reset button
   * @param {Event} event
   * @memberof LocalSearch
   */
  onClickReset(event) {
    this.clearQuery();
    this.clearResults();
    if (this.resetButton !== null) {
      this.resetButton.style.display = 'none';
    }
  }
  /**
   * handle event of changing search input
   * @param {Event} event
   * @memberof LocalSearch
   */
  onQueryChange(event) {
    console.log(event);
    if (this.isEmptyQuery()) {
      if (this.resetButton !== null) {
        this.resetButton.style.display = 'none';
      }
    } else {
      if (this.resetButton !== null) {
        this.resetButton.style.display = 'block';
      }
      if (this.searchAsYouType) {
        this.updateResults();
      }
    }
    if (this.hooks.onQueryChange) {
      this.hooks.onQueryChange(this.getQuery());
    }
  }
  /**
   * remove events listeners and clear memory
   * @memberof LocalSearch
   */
  destroy() {
    this.searchBox && this.searchBox.removeEventListener('keydown', this.onKeyDown);
    this.searchBox && this.searchBox.removeEventListener('input', this.onQueryChange);
    this.submitButton && this.submitButton.removeEventListener('click', this.onClickSubmit);
    this.resetButton && this.resetButton.removeEventListener('click', this.onClickReset);
    this.searchBox = null;
    this.searchResults = null;
    this.resetButton = null;
    this.submitButton = null;
    this.searchClient?.destroy();
    this.searchClient = null;
  }
}

export { LocalSearch, SearchClient, localsearch };
