class AppListItem extends HTMLElement {
    static observedAttributes = [
        'active',
        'disabled',
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
                    this.setAttribute('aria-disabled', true);
                } else {
                    this.setAttribute('aria-disabled', false);
                }
                break;
            case 'active':
                this._handleActive();
                break;
        }
    }
    _init() {
        this._handleActive();
        this.setAttribute('role', 'listitem');
        if (this.disabled) {
            this.setAttribute('aria-disabled', true);
            this.setAttribute('tabindex', -1);
        } else {
            this.setAttribute('aria-disabled', false);
            this.setAttribute('tabindex', 0);
        }
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