class AppOverlay extends HTMLElement {
    static observedAttributes = ['open', 'z-index'];
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
    constructor() {
        super();
        let template = document.querySelector('#template-app-overlay');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.overlayEl = this.shadowRoot.querySelector('.overlay');

        //Change context
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        // Prevent properties from being set prematurely
        this.upgradeProperty('open');
        this.overlayEl.classList.add('closed');
        this.overlayEl.setAttribute('hidden', '');
        this.overlayEl.addEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
    }
    disconnectedCallback() {
        this.overlayEl.removeEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'open':
                if (this.open) {
                    this._open();
                } else {
                    this._close();
                }
                break;
            case 'z-index':
                this.overlayEl.style.zIndex = newValue;
                break;
        }
    }
    _handleTransitionEnd(e) {
        if (!this.open) {
            this.overlayEl.setAttribute('hidden', '');
        }
    }
    _open() {
        this.overlayEl.removeAttribute('hidden');
        // When next frame is updated
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                this.overlayEl.classList.remove('closed');
                this.overlayEl.classList.add('opened');
            });
        });
    }
    _close() {
        this.overlayEl.classList.remove('opened');
        this.overlayEl.classList.add('closed');
    }
}