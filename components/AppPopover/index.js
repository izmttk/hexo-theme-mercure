class AppPopover extends HTMLElement {
    static observedAttributes = [
        'open', 
        'disabled',
        'width', 
        'height',
        'trigger',
        'anchor-reference',
        'anchor-position-top',
        'anchor-position-left',
        'anchor-origin-horizontal',
        'anchor-origin-vertical',
        'transform-origin-horizontal',
        'transform-origin-vertical',
        'boundary-margin',
        'z-index',
        'sub-menu',
    ];
    static mutationConfig = {
        childList: true,
        attributes: true,
        attributeFilter: ['open'],
    };
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
    get trigger() {
        return this.getAttribute('trigger') ?? 'click';
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-popover');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.toggleEl = this.shadowRoot.querySelector('.toggle');
        this.containerEl = this.shadowRoot.querySelector('.container');
        this._subdomObserver = new MutationObserver((mutations, observer) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this._init();
                }
                if (mutation.type === 'attributes') {
                    if (mutation.target.open === false) {
                        [...this.querySelectorAll('app-popover[sub-menu]')].forEach(item => {
                            item.open = false;
                        })
                    }
                }
            });
        });
        //Change context
        this._handleClickToggle = this._handleClickToggle.bind(this);
        this._handleClickOutside = this._handleClickOutside.bind(this);
        this._handleMouseenterToggle = this._handleMouseenterToggle.bind(this);
        this._handleMouseleaveToggle = this._handleMouseleaveToggle.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleKeydownToggle = this._handleKeydownToggle.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        // Prevent properties from being set prematurely
        this.upgradeProperty('open');
        this.upgradeProperty('disabled');
        this._init();
        this._subdomObserver.observe(this, AppPopover.mutationConfig);
        this.containerEl.addEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
        this.toggleEl?.addEventListener('keydown', this._handleKeydownToggle);
        this.toggleEl?.addEventListener('click', this._handleClickToggle);
        this.addEventListener('mouseenter', this._handleMouseenterToggle);
        this.addEventListener('mouseleave', this._handleMouseleaveToggle);
    }
    disconnectedCallback() {
        this._subdomObserver.disconnect();
        this.toggleEl?.removeEventListener('keydown', this._handleKeydownToggle);
        this.toggleEl?.removeEventListener('click', this._handleClickToggle);
        this.removeEventListener('mouseenter', this._handleMouseenterToggle);
        this.removeEventListener('mouseleave', this._handleMouseleaveToggle);
        this.containerEl.removeEventListener(
            'transitionend',
            this._handleTransitionEnd
        );
        document.removeEventListener('keydown', this._handleKeydown);
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
                    this.toggleEl.setAttribute('tabindex', -1);
                    this.toggleEl.setAttribute('aria-disabled', true);
                } else {
                    this.toggleEl.setAttribute('tabindex', 0);
                    this.toggleEl.setAttribute('aria-disabled', false);
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
            case 'trigger':
                break;
            case 'anchor-reference':
            case 'anchor-position-top':
            case 'anchor-position-left':
            case 'anchor-origin-vertical':
            case 'anchor-origin-horizontal':
                this.anchor = {
                    reference: this.getAttribute('anchor-reference') ?? 'parent',
                    origin: {
                        horizontal: this.getAttribute('anchor-origin-horizontal') ?? 'left',
                        vertical: this.getAttribute('anchor-origin-vertical') ?? 'bottom'
                    },
                    position: {
                        left: this.getAttribute('anchor-position-left') ?? '0',
                        top: this.getAttribute('anchor-position-top') ?? '100%'
                    }
                }
                switch (this.anchor.reference) {
                    case 'parent':
                        this.containerEl.style.position = 'absolute';
                        break;
                    case 'viewport':
                        this.containerEl.style.position = 'fixed';
                        break;
                }
                break;
            case 'transform-origin-vertical':
            case 'transform-origin-horizontal':
                this.transform = {
                    origin: {
                        horizontal: this.getAttribute('transform-origin-horizontal') ?? 'left',
                        vertical: this.getAttribute('transform-origin-vertical') ?? 'top'
                    }
                }
                break;
            case 'z-index':
                this.containerEl.style.zIndex = newValue;
                break;
            case 'sub-menu':
                this.setAttribute('anchor-origin-vertical', 'top');
                this.setAttribute('anchor-origin-horizontal', 'right');
                break;
        }
    }
    _init() {
        this.toggleEl.setAttribute('tabindex', 0);
        this.toggleEl.setAttribute('aria-disabled', false);
        this.containerEl.setAttribute('hidden', '');
        this.containerEl.classList.add('closed');

        this.anchor = {
            reference: this.getAttribute('anchor-reference') ?? 'parent',
            origin: {
                horizontal: this.getAttribute('anchor-origin-horizontal') ?? 'left',
                vertical: this.getAttribute('anchor-origin-vertical') ?? 'bottom'
            },
            position: {
                left: this.getAttribute('anchor-position-left') ?? '0',
                top: this.getAttribute('anchor-position-top') ?? '100%'
            }
        };
        this.transform = {
            origin: {
                horizontal: this.getAttribute('transform-origin-horizontal') ?? 'left',
                vertical: this.getAttribute('transform-origin-vertical') ?? 'top'
            }
        };
    }
    _updateAnchor() {
        let anchorLeft = 0, anchorTop = 0;
        switch (this.anchor.origin.horizontal) {
            case 'left':
                anchorLeft = 0
                break;
            case 'center':
                anchorLeft = this.toggleEl.getBoundingClientRect().width / 2;
                break;
            case 'right':
                anchorLeft = this.toggleEl.getBoundingClientRect().width;
                break;
        }
        switch (this.anchor.origin.vertical) {
            case 'top':
                anchorTop = 0
                break;
            case 'center':
                anchorTop = this.toggleEl.getBoundingClientRect().height / 2;
                break;
            case 'bottom':
                anchorTop = this.toggleEl.getBoundingClientRect().height;
                break;
        }
        switch (this.transform.origin.horizontal) {
            case 'left':
                anchorLeft -= 0;
                break;
            case 'center':
                anchorLeft -= this.containerEl.getBoundingClientRect().width / 2 / 0.75;
                break;
            case 'right':
                anchorLeft -= this.containerEl.getBoundingClientRect().width / 0.75;
                break;
        }
        switch (this.transform.origin.vertical) {
            case 'top':
                anchorTop -= 0
                break;
            case 'center':
                anchorTop -= this.containerEl.getBoundingClientRect().height / 2 / 0.5625;
                break;
            case 'bottom':
                anchorTop -= this.containerEl.getBoundingClientRect().height / 0.5625;
                break;
        }
        switch (this.anchor.reference) {
            case 'parent':
                this.containerEl.style.left = anchorLeft + 'px';
                this.containerEl.style.top = anchorTop + 'px';
                break;
            case 'viewport':
                this.containerEl.style.left = this.anchor.position.left;
                this.containerEl.style.top = this.anchor.position.top;
                break;
        }
        this.containerEl.style.transformOrigin = 
            `${this.transform.origin.horizontal} ${this.transform.origin.vertical}`;
    }
    _handleClickToggle(e) {
        if (this.disabled || this.trigger !== 'click') {
            return;
        }
        this.open = !this.open;
    }
    _handleClickOutside(e) {
        const target = e.target;
        const path = e.composedPath();
        if (!path.includes(this)) {
            this.open = false;
        }
    }
    _handleMouseenterToggle(e) {
        if (this.disabled || this.trigger !== 'hover') {
            return;
        }
        this.open = true;
    }
    _handleMouseleaveToggle(e) {
        if (this.disabled || this.trigger !== 'hover') {
            return;
        }
        this.open = false;
    }
    _handleKeydown(e) {
        let key = e.key;
        if (key === 'Escape') {
            this.open = false;
        }
    }
    _handleKeydownToggle(e) {
        let key = e.key;
        if (key === 'Enter') {
            this.open = !this.open;
        }
    }
    _handleTransitionEnd(e) {
        if (!this.open) {
            this.containerEl.setAttribute('hidden', '');
        }
    }
    _open() {
        this.containerEl.removeAttribute('hidden');
        // When next frame is updated
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                this.containerEl.classList.remove('closed');
                this.containerEl.classList.add('opened');
                this._updateAnchor();
            });
        });
        document.addEventListener('keydown', this._handleKeydown);
        document.addEventListener('click', this._handleClickOutside);
    }
    _close() {
        this.containerEl.classList.remove('opened');
        this.containerEl.classList.add('closed');
        document.removeEventListener('keydown', this._handleKeydown);
        document.removeEventListener('click', this._handleClickOutside);
    }
}
