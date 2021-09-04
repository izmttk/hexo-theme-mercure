class AppTabItem extends HTMLElement {
    static observedAttributes = ['disabled', 'label'];
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
    get label() {
        let labelEl = this.querySelector('[slot="label"]');
        if (labelEl) {
            return labelEl.innerHTML;
        } else {
            return this.getAttribute('label');
        }
    }
    get panel() {
        return this.this.querySelectorAll(':not([slot])');
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-tab-item');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.upgradeProperty('disabled');
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'disabled':
                if (this.disabled) {
                    this.setAttribute('tabindex', -1);
                    this.setAttribute('aria-disabled', true);
                } else {
                    this.setAttribute('tabindex', 0);
                    this.setAttribute('aria-disabled', false);
                }
                break;
        }
    }
}