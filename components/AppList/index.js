class AppList extends HTMLElement {
    static observedAttributes = [
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
        let template = document.querySelector('#template-app-list');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._subdomObserver = new MutationObserver((mutations, observer) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this._init();
                }
            });
        });
        this._handleClick = this._handleClick.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        Promise.all([
            customElements.whenDefined('app-list-item'),
            customElements.whenDefined('app-list-group'),
        ]).then(() => {
            this.upgradeProperty('disabled');
            this.upgradeProperty('two-line');
            this.upgradeProperty('three-line');
            this.upgradeProperty('dense');

            if (this.hasLightDOM()) {
                this._init();
            }
            this._subdomObserver.observe(this, AppList.mutationConfig);
            this.addEventListener('click', this._handleClick);
            this.addEventListener('keydown', this._handleKeydown);
        });
    }
    disconnectedCallback() {
        this._subdomObserver.disconnect();
        this.removeEventListener('click', this._handleClick);
        this.removeEventListener('keydown', this._handleKeydown);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        switch (name) {
            case 'disabled':
                if (this.disabled) {
                    this.setAttribute('aria-disabled', true);
                } else {
                    this.setAttribute('aria-disabled', false);
                }
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
        this.items = [...this.children].filter(item => (
            item.tagName.toLowerCase() === 'app-list-item' ||
            item.tagName.toLowerCase() === 'app-list-group'
        ));
        this.items.forEach(item => {
            item.dense = this.dense;
            item.twoLine = this.twoLine;
            item.threeLine = this.threeLine;
        });
        this.setAttribute('role', 'list');
    }
    _handleClick(e) {
        const path = e.composedPath();
        for (let index = 0; index < this.items.length; index++) {
            const element = this.items[index];
            if (element.tagName.toLowerCase() === 'app-list-item') {
                if (path.includes(element)) {
                    element.active = true;
                } else {
                    element.active = false;
                }
            }
        }
    }
    _handleKeydown(e) {
        if (e.key === 'Enter') {
            if (this.disabled) return;
            e.target.click();
        }
    }
    _handleTransitionEnd(e) {

    }
}