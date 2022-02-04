/**
 * @typedef {Object} SearchClientOptions
 * @property {string} [path] Path to request site data
 * @property {boolean} [cache] Cache search results
 * @property {RequestInit} [requestOptions] request options
 * @property {SearchOptions} [searchOptions] search headers
 */

/**
 * @typedef {Object} SearchOptions
 * @property {string[]} [searchableAttributes] attributes to search
 * @property {string[]} [attributesToHighlight] attributes to highlight
 * @property {string} [highlightPreTag] tag added before highlighted text
 * @property {string} [highlightPostTag] tag added after highlighted text
 * @property {string[]} [attributesToSnippet] attributes to snippet
 * @property {string} [snippetEllipsisText] ellipsis text around snippet
 * @property {string[]} [attributesToRetrieve] attributes that will be within the answer
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
     * Creates an instance of SearchClient.
     * @param {SearchClientOptions} [options={}] SearchClient options
     * @memberof SearchClient
     */
    constructor(options = {}) {
        /**
         * default search options
         * @type {{
         *   path: string,
         *   cache: boolean,
         *   requestOptions: RequestInit,
         *   searchOptions: SearchOptions
         * }}
         * @constant
         */
        const defaultOptions = {
            path: '/search.json',
            cache: true,
            requestOptions: {
                method: 'GET',
                mode: 'cors',
                cache: 'default',
                redirect: 'follow'
            },
            searchOptions: {
                searchableAttributes: [],
                attributesToHighlight: [],
                highlightPreTag: '<mark>',
                highlightPostTag: '</mark>',
                attributesToSnippet: [],
                snippetEllipsisText: '…',
                attributesToRetrieve: []
            }
        };
        options.requestOptions = {...defaultOptions.requestOptions, ...options.requestOptions};
        options.searchOptions = {...defaultOptions.searchOptions, ...options.searchOptions};
        options = {...defaultOptions, ...options};
        
        this.path = options.path;
        this.cache = options.cache;
        if(options.cache) {
            this.responsesCache = this.createInMemoryCache();
        }
        this.request = new Request(options.path, options.requestOptions);
        this.searchOptions = options.searchOptions;
    }
    /**
     * Setup searchOptions separately
     * @param {SearchOptions} [options={}] params for search options
     * @memberof SearchClient
     */
    configure(options =  this.searchOptions) {
        this.searchOptions = {...this.searchOptions, ...options};
    }
    /**
     * Search query and return results
     * @param {string} query Query to search
     * @param {SearchOptions} [options=this.searchOptions] Separate params for search options
     * @return {Promise<Hits>} Return hits array of search results
     * @memberof SearchClient
     */
    search(query, options = this.searchOptions) {
        return this.fetchSource()
        .then(data => {
            if(!Array.isArray(data)) {
                data = Array.from(data);
            }
            return data
            .map(item => this.handleItem(item, query, options))
            .filter(item => item !== null);
        });
    }
    /**
     * Handle single item, return null if item is not matched
     * @param {ResponseItem} item Item to handle
     * @param {string} [query=''] Query to search
     * @param {SearchOptions} [options=this.searchOptions] Separate params for search options
     * @return {ResponseItem|null} Return processed item
     * @memberof SearchClient
     */
    handleItem(item, query = '', options = this.searchOptions) {
        const keywords = query.trim().toLowerCase().split(/\s/);
        const regex = new RegExp(keywords.join('|'), 'gi');
        const hit = {};
        let hitted = false;
        options.attributesToRetrieve.forEach(attribute => {
            if(!(attribute in item)) {
                item[attribute] = '';
            }
            let attrValue = item[attribute].trim().toLowerCase();
            if(options.searchableAttributes.includes(attribute)) {
                const match = regex.exec(attrValue);
                hitted = match !== null;
                if(options.attributesToSnippet.includes(attribute)) {
                    const startIndex = match ? match.index : 0;
                    const endIndex = Math.max(startIndex - 10, 0) + 36;
                    let snippet =  attrValue.substring(startIndex, endIndex);
                    if(startIndex > 0) {
                        snippet = options.snippetEllipsisText + snippet;
                    }
                    if(endIndex < attrValue.length - 1) {
                        snippet = snippet + options.snippetEllipsisText;
                    }
                    attrValue = snippet;
                }
                if(options.attributesToHighlight.includes(attribute)) {
                    attrValue = attrValue.replace(regex, (match) => {
                        return options.highlightPreTag + match + options.highlightPostTag;
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
    createInMemoryCache(options = {
        serializable: true
    }) {
        let cache = {};
        return {
            get(key) {
                const keyAsString = JSON.stringify(key);
                if(keyAsString in cache) {
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
        if(this.cache) {
            return this.responsesCache.get(this.request).then(cache => {
                if(cache == null) {
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
        if(this.cache) {
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
        return this.responsesCache.clear()
        .then(() => {
            this.request = null;
            this.responsesCache = null;
        });
    }
}
/**
 * Factory function to create SearchClient instance
 * @param {string} path Path to request site data
 * @param {SearchClientOptions} [options={}] SearchClient options
 * @return {SearchClient} SearchClient instance
 */
const localsearch = function(path, options = {}) {
    const defaultOptions = {
        path,
        cache: true,
    }
    const searchClientOptions = { ...defaultOptions, ...options };
    return new SearchClient(searchClientOptions);
}


/**
 * @typedef {Object} LocalSearchOptions
 * @property {SearchClient|null} searchClient attributes to search
 * @property {string} [placeholder] attributes to highlight
 * @property {boolean} [searchAsYouType] tag added before highlighted text
 * @property {{
 *   item: function(ResponseItem=): string,
 *   empty: function(string=): string
 * }} [templates] tag added after highlighted text
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
     * Creates an instance of LocalSearch.
     * @param {LocalSearchOptions} options
     * @memberof LocalSearch
     */
    constructor(options) {
        const defaultOptions = {
            searchClient: null,
            placeholder: 'Search for...',
            searchAsYouType: false,
            templates: {
                item:  (/** @type {ResponseItem} */ hit) => `${hit.title}`,
                empty: (/** @type {string} */     query) => `No results found for "${query}"`,
            }
        };
        options.templates = {...defaultOptions.templates, ...options.templates};
        options = {...defaultOptions, ...options};
        this.searchClient = options.searchClient;
        this.placeholder = options.placeholder;
        this.searchAsYouType = options.searchAsYouType;
        this.templates = options.templates;
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
        if(element instanceof HTMLInputElement) {
            this.searchBox = element;
        } 
        else if(typeof element === 'string') {
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
        this.searchBox.dispatchEvent(new Event('input'));
        this.searchBox.placeholder = this.placeholder;
    }
    /**
     * clear and hide search results constainer
     * @memberof LocalSearch
     */
    clearResults() {
        this.searchResults.innerHTML = '';
        this.searchResults.hidden = true;
    }
    /**
     * update search results container using query from input
     * @memberof LocalSearch
     */
    updateResults() {
        this.clearResults();
        this.searchResults.hidden = false;
        const query = this.getQuery();
        Promise.resolve()
        .then(() => {
            if(!this.isEmptyQuery()) {
                return this.searchClient.search(query);
            } else {
                return [];
            }
        })
        .then(results => {
            if(results.length > 0) {
                const listElement = document.createElement('ol');
                listElement.classList.add('local-Hits-list');
                results.forEach(result => {
                    const resultElement = document.createElement('li');
                    resultElement.classList.add('local-Hits-item');
                    resultElement.innerHTML = this.templates.item(result);
                    listElement.appendChild(resultElement);
                });
                this.searchResults.appendChild(listElement);
            } else {
                this.searchResults.innerHTML = this.templates.empty(query);
            }
        });
    }
    /**
     * get value from search input
     * @return {string} 
     * @memberof LocalSearch
     */
    getQuery() {
        return this.searchBox.value;
    }
    /**
     * clear search input
     * @memberof LocalSearch
     */
    clearQuery() {
        this.searchBox.value = '';
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
        if(event.key === 'Enter') {
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
        this.resetButton.hidden = true;
    }
    /**
     * handle event of changing search input
     * @param {Event} event
     * @memberof LocalSearch
     */
    onQueryChange(event) {
        if(this.isEmptyQuery()) {
            this.resetButton.hidden = true;
            this.searchResults.hidden = true;
        } else {
            this.resetButton.hidden = false;
            if(this.searchAsYouType) {
                this.updateResults();
            }
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
        this.searchClient.destroy();
        this.searchClient = null;
    }
}