class AppListItem extends HTMLElement {
    static observedAttributes = [
        'active',
        'disabled',
        'href',
    ];
    static mutationConfig = {
        childList: true,
    }
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
    get active() {
        return (
            this.hasAttribute('active') && this.getAttribute('active') !== 'false'
        );
    }
    set active(val) {
        if (val) {
            this.setAttribute('active', '');
        } else {
            this.removeAttribute('active');
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
    get href() {
        return this.getAttribute('href');
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-list-item');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.inactivedSlot = [...this.shadowRoot.querySelectorAll('slot:not([name^="actived"])')];
        this._subdomObserver = new MutationObserver((mutations, observer) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this._init();
                }
            });
        });
        this._handleClickToggle = this._handleClickToggle.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        if (this.hasLightDOM()) {
            this._init();
        }
        this.upgradeProperty('disabled');
        this.upgradeProperty('active');
        this._subdomObserver.observe(this, AppListItem.mutationConfig);
    }
    disconnectedCallback() {
        this._subdomObserver.disconnect();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        switch (name) {
            case 'disabled':
                if (this.disabled) {
                    wrapperEl.setAttribute('aria-disabled', true);
                } else {
                    wrapperEl.setAttribute('aria-disabled', false);
                }
                break;
            case 'active':
                this._handleActive();
                break;
            case 'href':
                if (this.href) {
                    let wrapperEl = this.shadowRoot.querySelector('.wrapper');
                    let linkEl = document.createElement('a');
                    [...wrapperEl.attributes].forEach(attr => {
                        linkEl.attributes.setNamedItem(attr.cloneNode());
                    });
                    linkEl.href = this.href;
                    [...wrapperEl.children].forEach(el => linkEl.appendChild(el));
                    wrapperEl.remove();
                    this.shadowRoot.appendChild(linkEl);
                }
                break;
        }
    }
    _init() {
        this._handleActive();
        let wrapperEl = this.shadowRoot.querySelector('.wrapper');
        this.setAttribute('role', 'listitem');
        if (this.disabled) {
            wrapperEl.setAttribute('aria-disabled', true);
            wrapperEl.setAttribute('tabindex', -1);
        } else {
            wrapperEl.setAttribute('aria-disabled', false);
            wrapperEl.setAttribute('tabindex', 0);
        }
        let prefixEl = this.shadowRoot.querySelector('.prefix');
        let suffixEl = this.shadowRoot.querySelector('.suffix');
        prefixEl.hidden = true;
        suffixEl.hidden = true;
        [...prefixEl.querySelectorAll('slot')].forEach(slot => {
            if (slot.assignedNodes().length !== 0) {
                prefixEl.hidden = false;
            }
        });
        [...suffixEl.querySelectorAll('slot')].forEach(slot => {
            if (slot.assignedNodes().length !== 0) {
                suffixEl.hidden = false;
            }
        });
    }
    _handleActive() {
        if (this.active) {
            this.inactivedSlot.forEach(item => {
                const activeName = 'actived-' + item.getAttribute('name');
                const element = this.shadowRoot.querySelector(`slot[name="${activeName}"]`);
                if (element.assignedNodes().length > 0) {
                    item.setAttribute('hidden', '');
                    element.removeAttribute('hidden');
                }
            });
        } else {
            this.inactivedSlot.forEach(item => {
                const activeName = 'actived-' + item.getAttribute('name');
                const element = this.shadowRoot.querySelector(`slot[name="${activeName}"]`);
                item.removeAttribute('hidden');
                element.setAttribute('hidden', '');
            });
        }
    }
    _handleClickToggle(e) {

    }
    _handleKeydown(e) {

    }
    _handleTransitionEnd(e) {

    }
}