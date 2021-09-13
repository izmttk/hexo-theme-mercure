class AppModal extends HTMLElement {
    static observedAttributes = ['open', 'disabled', 'width', 'height'];
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
    constructor() {
        super();
        let template = document.querySelector('#template-app-modal');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.toggleEl = this.shadowRoot.querySelector('.toggle');
        this.bodyEl = this.shadowRoot.querySelector('.body');
        this.overlayEl = this.shadowRoot.querySelector('app-overlay');
        this.closeBtnEl = this.shadowRoot.querySelector('.close-btn');
        this.containerEl = this.shadowRoot.querySelector('.container');

        //Change context
        this._handleClickToggle = this._handleClickToggle.bind(this);
        this._handleClickClose = this._handleClickClose.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        // Prevent properties from being set prematurely
        this.upgradeProperty('open');
        this.upgradeProperty('disabled');
        this._init();
        this.toggleEl?.addEventListener('click', this._handleClickToggle);
        this.closeBtnEl.addEventListener('click', this._handleClickClose);
        this.containerEl.addEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
    }
    disconnectedCallback() {
        this.toggleEl?.removeEventListener('click', this._handleClickToggle);
        this.closeBtnEl.removeEventListener('click', this._handleClickClose);
        this.containerEl.removeEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
        document.removeEventListener('keydown', this._handleKeydown);
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
            case 'disabled':
                if (this.disabled) {
                    this.setAttribute('tabindex', -1);
                    this.setAttribute('aria-disabled', true);
                } else {
                    this.setAttribute('tabindex', 0);
                    this.setAttribute('aria-disabled', false);
                }
                break;
            case 'width':
                const width = newValue;
                this.containerEl.style.width = width;
                break;
            case 'height':
                const height = newValue;
                this.containerEl.style.height = height;
                break;
        }
    }
    _init() {
        this.bodyEl.setAttribute('hidden', '');
        this.bodyEl.classList.add('closed');
        this.setAttribute('tabindex', -1);
        this.setAttribute('aria-disabled', true);
    }
    _handleClickToggle(e) {
        if (this.disabled) {
            return;
        }
        let target = e.target;
        this.open = !this.open;
    }
    _handleClickClose(e) {
        let target = e.target;
        this.open = false;
    }
    _handleKeydown(e) {
        let key = e.key;
        if (key === 'Escape') {
            this.open = false;
        }
    }
    _handleTransitionEnd(e) {
        if (!this.open) {
            this.bodyEl.setAttribute('hidden', '');
        }
    }
    _open() {
        this.bodyEl.removeAttribute('hidden');
        this.overlayEl.setAttribute('open', '');
        // When next frame is updated
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                this.bodyEl.classList.remove('closed');
                this.bodyEl.classList.add('opened');
            });
        });
        document.addEventListener('keydown', this._handleKeydown);
    }
    _close() {
        this.overlayEl.removeAttribute('open');
        this.bodyEl.classList.remove('opened');
        this.bodyEl.classList.add('closed');
        document.removeEventListener('keydown', this._handleKeydown);
    }
}