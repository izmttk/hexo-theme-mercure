class AppCollapseGroup extends HTMLElement {
    static observedAttributes = [
        'accordion',
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
    get accordion() {
        return (
            this.hasAttribute('accordion') &&
            this.getAttribute('accordion') !== 'false'
        );
    }
    get collapses() {
        return [...this.children].filter(el => el.tagName.toLowerCase() === 'app-collapse');
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-collapse-group');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this._handleMutation = this._handleMutation.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._subdomObserver = new MutationObserver(this._handleMutation);
    }
    connectedCallback() {
        Promise.all([customElements.whenDefined('app-collapse')]).then(() => {
            this.upgradeProperty('disabled');
            if (this.hasLightDOM()) {
                this._init();
            }
            this._subdomObserver.observe(this, AppCollapseGroup.mutationConfig);

            //intercept click event in capture phase
            this.addEventListener('click', this._handleClick, true);
        });
    }
    disconnectedCallback() {
        this._subdomObserver.disconnect();
        this.removeListener('click', this._handleClick, true);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        switch (name) {
            case 'disabled':
                if (this.disabled) {
                    this.setAttribute('aria-disabled', true);
                    this.collapses.forEach(item => item.disabled = true);
                } else {
                    this.setAttribute('aria-disabled', false);
                    this.collapses.forEach(item => item.disabled = false);
                }
                break;
            case 'accordion':
                break;
        }
    }
    _handleMutation(mutations, observer) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && this.collapses.includes(mutation.target)) {
                this._init();
            }
        });
    }
    _handleClick(e) {
        if (this.disabled) {
            e.stopPropagation();
            return;
        }
        const path = e.composedPath();
        let target = null;
        for (let index = 0; index < this.collapses.length; index++) {
            const element = this.collapses[index];
            if (path.includes(element.toggleEl)) {
                target = element;
                element.open = !element.open;
                element.toggleEl.focus();
                e.stopPropagation();
                break;
            }
        }
        if (target !== null && this.accordion) {
            this.collapses.forEach(item => {
                if (target !== item) {
                    item.open = false;
                }
            });
        }
    }
    _init() {
        this.collapses.forEach(item => item.classList.add('group-item'));
    }
    open(index) {
        if (this.accordion) {
            for (let i = 0; i < this.collapses.length; i++) {
                if (index !== i) {
                    const element = this.collapses[i];
                    element.open = false;
                }
            }
        }
        if (this.collapses.length > index && !this.collapses[index].open) {
            this.collapses[index].open = true;
        }
    }
    close(index) {
        if (this.collapses.length > index && this.collapses[index].open) {
            this.collapses[index].open = false;
        }
    }
    openAll() {
        if (this.accordion) return;
        this.collapses.forEach(item => item.open = true);
    }
    closeAll() {
        if (this.accordion) return;
        this.collapses.forEach(item => item.open = false);
    }
}