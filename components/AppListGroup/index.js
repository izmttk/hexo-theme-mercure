class AppListGroup extends HTMLElement {
    static observedAttributes = [
        'sub-group',
        'open',
        'disabled',
        'two-line',
        'three-line',
        'dense',
    ];
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
    get open() {
        return (
            this.hasAttribute('open') && this.getAttribute('open') !== 'false'
        );
    }
    set open(val) {
        if (val) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }
    }
    get subGroup() {
        return (
            this.hasAttribute('sub-group') && this.getAttribute('sub-group') !== 'false'
        );
    }
    set subGroup(val) {
        if (val) {
            this.setAttribute('sub-group', '');
        } else {
            this.removeAttribute('sub-group');
        }
    }
    get twoLine() {
        return (
            this.hasAttribute('two-line') && this.getAttribute('two-line') !== 'false'
        );
    }
    set twoLine(val) {
        if (val) {
            this.setAttribute('two-line', '');
        } else {
            this.removeAttribute('two-line');
        }
    }
    get threeLine() {
        return (
            this.hasAttribute('three-line') && this.getAttribute('three-line') !== 'false'
        );
    }
    set threeLine(val) {
        if (val) {
            this.setAttribute('three-line', '');
        } else {
            this.removeAttribute('three-line');
        }
    }
    get dense() {
        return (
            this.hasAttribute('dense') && this.getAttribute('dense') !== 'false'
        );
    }
    set dense(val) {
        if (val) {
            this.setAttribute('dense', '');
        } else {
            this.removeAttribute('dense');
        }
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-list-group');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.toggleEl = this.shadowRoot.querySelector('.header');
        this.bodyEl = this.shadowRoot.querySelector('.body');

        this._subdomObserver = new MutationObserver((mutations, observer) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this._init();
                }
            });
        });
        this._handleClickToggle = this._handleClickToggle.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        Promise.all([
            customElements.whenDefined('app-list-item'),
            customElements.whenDefined('app-list-group'),
        ]).then(() => {
            this.upgradeProperty('disabled');
            this.upgradeProperty('open');
            this.upgradeProperty('sub-group');
            this.upgradeProperty('two-line');
            this.upgradeProperty('three-line');
            this.upgradeProperty('dense');

            this._init();
            this._subdomObserver.observe(this, AppListGroup.mutationConfig);
            this.toggleEl.addEventListener('click', this._handleClickToggle);
            this.addEventListener('click', this._handleClick);
            this.bodyEl.addEventListener('transitionend', this._handleTransitionEnd);
        });
    }
    disconnectedCallback() {
        this._subdomObserver.disconnect();
        this.toggleEl.removeEventListener('click', this._handleClickToggle);
        this.removeEventListener('click', this._handleClick);
        this.bodyEl.removeEventListener('transitionend', this._handleTransitionEnd);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        switch (name) {
            case 'open':
                if (this.open) {
                    this._open();
                } else {
                    this._close();
                }
                break;
            case 'disabled':
                if (this.disabled) {
                    this.setAttribute('aria-disabled', true);
                    this.toggleEl.removeAttribute('tabindex');
                } else {
                    this.setAttribute('aria-disabled', false);
                    this.toggleEl.setAttribute('tabindex', 0);
                }
                break;
            case 'sub-group':
                break;
            case 'two-line':
                this.items?.forEach(item => {
                    item.twoLine = this.twoLine;
                });
                break;
            case 'three-line':
                this.items?.forEach(item => {
                    item.threeLine = this.threeLine;
                });
            break;
            case 'dense':
                this.items?.forEach(item => {
                    item.dense = this.dense;
                });
            break;
        }
    }
    _init() {
        if (!this.open) {
            this.bodyEl.setAttribute('hidden', '');
            this.setAttribute('aria-expanded', false);
            this.toggleEl.setAttribute('aria-expanded', false);
        }
        this.items = [...this.children].filter(item => (
            item.tagName.toLowerCase() === 'app-list-item' ||
            item.tagName.toLowerCase() === 'app-list-group'
        ));
        this.items.forEach(item => {
            item.dense = this.dense;
            item.twoLine = this.twoLine;
            item.threeLine = this.threeLine;

            if (this.subGroup) {
                if (item.tagName.toLowerCase() === 'app-list-item') {

                }
                
            }
        });
        const slottedListItem = this.querySelector('app-list-item[slot="toggle"]');
        if (slottedListItem !== null) {
            if (this.open) {
                slottedListItem.active = true;
            } else {
                slottedListItem.active = false;

            }
        }
    }
    _handleClickToggle(e) {
        this.toggleEl.focus();
        if (this.disabled) return;
        this._toggle();
    }
    _handleClick(e) {
        const path = e.composedPath();
        for (let index = 0; index < this.items.length; index++) {
            const element = this.items[index];
            if (element.tagName.toLowerCase() === 'app-list-item'  && element.slot !== 'toggle') {
                if (path.includes(element)) {
                    element.active = true;
                } else {
                    element.active = false;
                }
            }
        }
    }
    _handleTransitionEnd(e) {
        if (!this.open) {
            this.bodyEl.setAttribute('hidden', '');
        }
        this.bodyEl.style.height = null;
    }
    _toggle() {
        this.open = !this.open;
    }
    _open() {
        this.setAttribute('aria-expanded', true);
        this.toggleEl.setAttribute('aria-expanded', true);

        if (!this.bodyEl.hasAttribute('hidden')) return;

        this.bodyEl.removeAttribute('hidden');

        const slottedListItem = this.querySelector('app-list-item[slot="toggle"]');
        if (slottedListItem !== null) {
            slottedListItem.active = true;
        }

        this.bodyEl.style.height = 0;
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                let height = this.bodyEl.scrollHeight;
                this.bodyEl.style.height = height + 'px';
            })
        });
    }
    _close() {
        this.setAttribute('aria-expanded', false);
        this.toggleEl.setAttribute('aria-expanded', false);


        if (this.bodyEl.hasAttribute('hidden')) return;

        const slottedListItem = this.querySelector('app-list-item[slot="toggle"]');
        if (slottedListItem !== null) {
            slottedListItem.active = false;
        }

        let height = this.bodyEl.scrollHeight;
        this.bodyEl.style.height = height + 'px';
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                this.bodyEl.style.height = 0;
            })
        });
    }
}