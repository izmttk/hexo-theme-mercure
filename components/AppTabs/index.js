class AppTabs extends HTMLElement {
    static observedAttributes = ['disabled', 'active-tab', 'stretch'];
    static mutationConfig = {
        childList: true,
    };
    get disabled() {
        return (
            this.hasAttribute('disabled') &&
            this.getAttribute('disabled') !== 'false'
        );
    }
    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }
    get activeTab() {
        return this.getAttribute('active-tab');
    }
    set activeTab(val) {
        this.setAttribute('active-tab', val);
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-tabs');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        // const styleSheet = new CSSStyleSheet();
        // styleSheet.replace(``);
        // this.shadowRoot.adoptedStyleSheets = [styleSheet];
        this.tabEl = this.shadowRoot.querySelector('.header');
        this.panelEl = this.shadowRoot.querySelector('.body');
        this.sliderEl = this.shadowRoot.querySelector('.slider');
        this._init = this._init.bind(this);
        this._subdomObserver = new MutationObserver((mutations, observer) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this._init();
                }
            });
        });
        this._visibleObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // use offsetParent to judge if an element has been hidden
                if (entry.intersectionRatio >= 0 && this.offsetParent !== null) {
                    this._init();
                    this._visibleObserver.disconnect();
                }
            });
        });
        this._handleClickTab = this._handleClickTab.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        Promise.all([customElements.whenDefined('app-tab-item')]).then(() => {
            this.upgradeProperty('disabled');
            this.upgradeProperty('activeTab');
            if (this.hasLightDOM()) {
                this._init();
            }
            this._subdomObserver.observe(this, AppTabs.mutationConfig);
            this._visibleObserver.observe(this);
            this.tabEl.addEventListener('click', this._handleClickTab);
            this.tabEl.addEventListener('keydown', this._handleKeydown);
            this.panelEl.addEventListener(
                'transitionend',
                this._handleTransitionEnd
            );
        });
    }
    disconnectedCallback() {
        this._subdomObserver.disconnect();
        this._visibleObserver.disconnect();
        this.tabEl.removeEventListener('click', this._handleClickTab);
        this.tabEl.removeEventListener('keydown', this._handleKeydown);
        this.panelEl.removeEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'disabled':
                if (this.disabled) {
                    this.setAttribute('aria-disabled', true);
                } else {
                    this.setAttribute('aria-disabled', false);
                }
                break;
            case 'active-tab':
                this._setActive(oldValue, newValue);
                break;
            case 'stretch':
                if (this.hasAttribute('stretch')) {
                    this.tabEl.classList.add('stretch');
                } else {
                    this.tabEl.classList.remove('stretch');
                }
                break;
        }
    }
    _init() {
        this.items = this.querySelectorAll('app-tab-item:not([disabled])');
        this.tabNum = this.items.length;
        if(this.tabNum === 0) return;
        if (window.ShadyCSS) this._subdomObserver.disconnect();

        this.tabEl.querySelectorAll('.tablist .tab').forEach(item => {
            item.remove();
        });
        for (let index = 0; index < this.tabNum; index++) {
            const element = this.items[index];
            let label = document.createElement('div');
            label.classList.add('tab');
            label.insertAdjacentHTML('afterbegin', element.label);
            label.setAttribute('index', index);
            label.setAttribute('role', 'tab');
            label.setAttribute('aria-selected', false);
            label.setAttribute('tabindex', 0);
            element.setAttribute('hidden', '');
            element.setAttribute('index', index);
            this.tabEl.querySelector('.tablist').appendChild(label);
        }
        if (this.activeTab === null) {
            this.activeTab = 0;
        } else {
            this._setActive(null, this.activeTab);
        }
        if (window.ShadyCSS) this._subdomObserver.observe(this, AppTabs.mutationConfig);
    }

    _setActive(oldTab, newTab) {
        if(oldTab === newTab) return;
        if (oldTab !== null) {
            let tab = this.tabEl.querySelector(`.tab[index='${oldTab}']`);
            tab.removeAttribute('active');
            tab.setAttribute('aria-selected', false);
            this.panelEl.style.height =
                this.items[oldTab].getBoundingClientRect().height + 'px';
            this.panelEl.style.overflow = 'hidden';
            this.items[oldTab].style.position = 'absolute';
            this.items[newTab].style.position = 'absolute';
            if (newTab > oldTab) {
                this.items[newTab].style.transform = 'translateX(100%)';
            } else {
                this.items[newTab].style.transform = 'translateX(-100%)';
            }
            this.items[newTab].style.opacity = 0;

        }
        let tab = this.tabEl.querySelector(`.tab[index='${newTab}']`);
        tab.setAttribute('active', '');
        tab.setAttribute('aria-selected', true);
        this.items[newTab].removeAttribute('hidden');
        tab.focus();

        this.sliderEl.style.width = tab.offsetWidth + 'px';
        this.sliderEl.style.left = tab.offsetLeft + 'px';

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (oldTab !== null) {
                    this.panelEl.style.height =
                        this.items[newTab].getBoundingClientRect().height + 'px';
                    if (newTab > oldTab) {
                        this.items[oldTab].style.transform = 'translateX(-100%)';
                    } else {
                        this.items[oldTab].style.transform = 'translateX(100%)';
                    }
                    this.items[oldTab].style.opacity = 0;
                }
                this.items[newTab].style.transform = null;
                this.items[newTab].style.opacity = null;
            });
        });
    }
    _handleClickTab(e) {
        const target = e.target;
        const path = e.composedPath();
        const tabs = [...this.tabEl.querySelectorAll('.tab[index]')];
        for (let index = 0; index < tabs.length; index++) {
            const element = tabs[index];
            if(path.includes(element)) {
                this.activeTab = element.getAttribute('index');
                break;
            }
        }
    }
    _handleKeydown(e) {
        let key = e.key;
        let target = e.target;
        if (key === 'Enter') {
            target.click();
        }
        else if (key === 'ArrowLeft') {
            if (this.activeTab > 0) {
                this.activeTab--;
            }
        } else if (key === 'ArrowRight') {
            if (this.activeTab < this.tabNum - 1) {
                this.activeTab++;
            }
        }
    }
    _handleTransitionEnd(e) {
        let target = e.target;
        if (target.tagName.toLowerCase() === 'app-tab-item' && 
            target.getAttribute('index') === this.activeTab) {
            this.panelEl.style.height = 'auto';
            this.panelEl.style.overflow = null;
            for (let index = 0; index < this.items.length; index++) {
                const element = this.items[index];
                element.style.position = null;
                element.style.transform = null;
                element.style.opacity = null;
                if (index != this.activeTab) {
                    element.setAttribute('hidden', '');
                }
            }
        }
    }
}