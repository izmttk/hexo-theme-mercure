class AppCollapse extends HTMLElement {
    static observedAttributes = [
        'open',
        'title',
        'header-height',
        'disabled', 
    ];
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
    get title() {
        return this.getAttribute('title');
    }
    set title(val) {
        this.setAttribute('title', val);
    }
    constructor() {
        super();
        let template = document.querySelector('#template-app-collapse');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.toggleEl = this.shadowRoot.querySelector('.header');
        this.bodyEl = this.shadowRoot.querySelector('.body');

        this._handleClickToggle = this._handleClickToggle.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleTransitionEnd = this._handleTransitionEnd.bind(this);
    }
    connectedCallback() {
        this.upgradeProperty('disabled');
        this.upgradeProperty('open');
        this._init();
        this.toggleEl.addEventListener('click', this._handleClickToggle);
        this.toggleEl.addEventListener('keydown', this._handleKeydown);
        this.bodyEl.addEventListener('transitionend', this._handleTransitionEnd);
    }
    disconnectedCallback() {
        this.toggleEl.removeEventListener('click', this._handleClickToggle);
        this.toggleEl.removeEventListener('keydown', this._handleKeydown);
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
            case 'title':
                // [...this.querySelectorAll('slot[name="title"]')].forEach(item => {
                //     item.remove();
                // });
                if (this.title !== null && this.title !== undefined) {
                    let span = document.createElement('span');
                    span.innerText = newValue;
                    span.slot = 'title';
                    this.shadowRoot.querySelector('.title').appendChild(span);
                    this.shadowRoot.querySelector('slot[name="title"]').setAttribute('hidden', '');
                }
                break;
            case 'header-height':
                this.toggleEl.style.height = newValue;
                break;
        }
    }
    _init() {
        if (!this.open) {
            this.bodyEl.setAttribute('hidden', '');
            this.setAttribute('aria-expanded', false);
            this.toggleEl.setAttribute('aria-expanded', false);
        }
    }
    _handleClickToggle(e) {
        this.toggleEl.focus();
        if (this.disabled) return;
        this._toggle();
    }
    _handleKeydown(e) {
        if (e.key === 'Enter') {
            if (this.disabled) return;
            this._toggle();
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
        this.bodyEl.removeAttribute('hidden');
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

        let height = this.bodyEl.scrollHeight;
        this.bodyEl.style.height = height + 'px';
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                this.bodyEl.style.height = 0;
            })
        });
    }
}