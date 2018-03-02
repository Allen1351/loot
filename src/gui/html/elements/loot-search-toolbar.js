/*
<link rel="import" href="../../../../bower_components/shadycss/apply-shim.html">
<link rel="import" href="../../../../bower_components/app-layout/app-toolbar/app-toolbar.html">
<link rel="import" href="../../../../bower_components/iron-icons/iron-icons.html">
<link rel="import" href="../../../../bower_components/iron-flex-layout/iron-flex-layout.html">
<link rel="import" href="../../../../bower_components/paper-icon-button/paper-icon-button.html">
<link rel="import" href="../../../../bower_components/paper-input/paper-input.html">
<link rel="import" href="../../../../bower_components/paper-tooltip/paper-tooltip.html">
*/

export class LootSearchToolbar extends Polymer.Element {
  static get is() {
    return 'loot-search-toolbar';
  }

  static get properties() {
    return {
      _currentResult: {
        type: Number,
        value: -1,
        observer: '_currentResultChanged'
      },
      results: {
        type: Array,
        value: () => [],
        observer: '_resultsChanged'
      }
    };
  }

  static get template() {
    return Polymer.html`
      <style>
        app-toolbar {
          height: 56px;
          background: var(--primary-color);
          color: var(--dark-theme-text-color);
        }

        #search {
          @apply --layout-flex;

          --paper-input-container-input-color: var(--dark-theme-text-color);
          --paper-input-container-color: var(--dark-theme-secondary-color);
          --paper-input-container-underline: {
            border-color: var(--dark-theme-divider-color);
          };

          display: block;
        }
        #count {
          font-weight: 400;
          font-size: 0.857rem;
          color: var(--dark-theme-secondary-color);
        }
      </style>
      <app-toolbar>
        <paper-input id="search" label="Search cards" no-label-float></paper-input>
        <div id="count">
          <span>[[_computeResultNum(_currentResult)]]</span>
          /
          <span><!-- number of results --></span>
        </div>
        <paper-icon-button id="prev" icon="expand-less" disabled></paper-icon-button>
        <paper-icon-button id="next" icon="expand-more" disabled></paper-icon-button>
        <paper-icon-button id="close" icon="close"></paper-icon-button>
      </app-toolbar>`;
  }

  _currentResultChanged(newValue) {
    if (this.results && this.results.length > 0) {
      if (this.results.length === 1) {
        this.$.prev.disabled = true;
        this.$.next.disabled = true;
      } else if (newValue === 0) {
        this.$.prev.disabled = true;
        this.$.next.disabled = false;
      } else if (newValue === this.results.length - 1) {
        this.$.prev.disabled = false;
        this.$.next.disabled = true;
      } else {
        this.$.prev.disabled = false;
        this.$.next.disabled = false;
      }
    }
    if (newValue > -1) {
      this.dispatchEvent(
        new CustomEvent('loot-search-change-selection', {
          detail: { selection: this.results[newValue] },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  _resultsChanged(newValue) {
    this.$.count.lastElementChild.textContent = newValue.length;
    if (newValue.length > 0) {
      this._currentResult = 0;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.search.addEventListener('input', this._onSearch);
    this.$.search.addEventListener('keyup', this._onEnter);
    this.$.prev.addEventListener('click', this._onPrev);
    this.$.next.addEventListener('click', this._onNext);
    this.$.close.addEventListener('click', this._onClose);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.$.search.removeEventListener('input', this._onSearch);
    this.$.search.removeEventListener('keyup', this._onEnter);
    this.$.prev.removeEventListener('click', this._onPrev);
    this.$.next.removeEventListener('click', this._onNext);
    this.$.close.removeEventListener('change', this._onClose);
  }

  _onEnter(evt) {
    const host = evt.target.parentElement.parentNode.host;
    if (evt.keyCode !== 13 || host.results.length === 0) {
      return;
    }
    if (host._currentResult === host.results.length - 1) {
      host._currentResult = 0;
    } else {
      host._currentResult += 1;
    }
  }

  focusInput() {
    this.$.search.focus();
  }

  _resetResults() {
    this.results = [];
    this._currentResult = -1;
    this.$.prev.setAttribute('disabled', '');
    this.$.next.setAttribute('disabled', '');
  }

  search() {
    this.$.search.dispatchEvent(new Event('input'));
  }

  _onSearch(evt) {
    evt.target.parentElement.parentNode.host._resetResults();

    const needle = evt.target.value ? evt.target.value.toLowerCase() : '';
    evt.target.dispatchEvent(
      new CustomEvent('loot-search-begin', {
        detail: { needle },
        bubbles: true,
        composed: true
      })
    );
  }

  _onPrev(evt) {
    evt.target.parentElement.parentNode.host._currentResult -= 1;
  }

  _onNext(evt) {
    evt.target.parentElement.parentNode.host._currentResult += 1;
  }

  _onClose(evt) {
    const host = evt.target.parentElement.parentNode.host;
    host._resetResults();
    host.$.search.value = '';
    host.$.count.classList.toggle('hidden', true);
    evt.target.dispatchEvent(
      new CustomEvent('loot-search-end', {
        bubbles: true,
        composed: true
      })
    );
  }

  _computeResultNum(currentResult) {
    return currentResult + 1;
  }
}

customElements.define(LootSearchToolbar.is, LootSearchToolbar);
