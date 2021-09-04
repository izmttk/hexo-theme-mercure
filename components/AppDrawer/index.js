class AppDrawer extends HTMLElement {
    static observedAttributes = [
        'open',
        'disabled',
        'width',
        'height',
        'placement',
        'position',
    ];
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
        let template = document.querySelector('#template-app-drawer');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.bodyEl = this.shadowRoot.querySelector('.body');
        this.overlayEl = this.shadowRoot.querySelector('app-overlay');
        this.containerEl = this.shadowRoot.querySelector('.container');

        //Change context
        this._handleClickToggle = this._handleClickToggle.bind(this);
        this._handleClickOverlay = this._handleClickOverlay.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        // Prevent properties from being set prematurely
        this.upgradeProperty('open');
        this.upgradeProperty('disabled');
        this._init();
        this.toggleEl?.addEventListener('click', this._handleClickToggle);
        this.overlayEl?.addEventListener('click', this._handleClickOverlay);
        this.containerEl.addEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
    }
    disconnectedCallback() {
        this.toggleEl?.removeEventListener('click', this._handleClickToggle);
        this.overlayEl?.removeEventListener('click', this._handleClickOverlay);
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
            case 'placement':
                const placement = newValue;
                if (placement === 'left') {
                    this.bodyEl.classList.remove('right');
                    this.bodyEl.classList.add('left');
                } else if (placement === 'right') {
                    this.bodyEl.classList.remove('left');
                    this.bodyEl.classList.add('right');
                }
                break;
            case 'position':
                const position = newValue;
                this.bodyEl.style.position = position;
                break;
        }
    }
    _init() {
        this.toggleEl = this.querySelector('[slot="toggle"]');

        if(!this.hasAttribute('open')) {
            this.bodyEl.setAttribute('hidden', '');
            this.bodyEl.classList.add('closed');
        }
        if(!this.hasAttribute('placement')) {
            this.bodyEl.classList.add('left');
        }
        if(!this.hasAttribute('disabled')) {
            this.setAttribute('tabindex', -1);
            this.setAttribute('aria-disabled', true);
        }
    }
    _handleClickToggle(e) {
        if (this.disabled) {
            return;
        }
        let target = e.target;
        this.open = !this.open;
    }
    _handleClickOverlay(e) {
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