/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Mailvelope GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

class PgpEncryptedForm extends HTMLElement {
  static get observedAttributes() {
    return ['hash', 'signature', 'version', 'comment']
  }

  constructor() {
    super();
  }

  // Invoked when the custom element is moved to a new document.
  adoptedCallback() {
    // console.log('PgpEncryptedForm::adoptedCallback');
  }

  // Invoked when one of the custom element's attributes is added, removed, or changed.
  attributeChangedCallback(attrName, oldValue, newValue) {
    // console.log('PgpEncryptedForm::attributeChangedCallback');
  }

  // Invoked when the custom element is first connected to the document's DOM.
  connectedCallback() {
    // console.log('PgpEncryptedForm::connectedCallback');
    let errorMsg;
    if (typeof this.getAttribute('id') === 'undefined') {
      errorMsg = 'No form id defined. Please add a unique form identifier.';
      return this._onError(errorMsg);
    }

    if (typeof window.mailvelope !== 'undefined') {
      this.mailvelopeLoaded();
    } else {
      this.classList.add('loading');
      window.addEventListener('mailvelope', this.mailvelopeLoaded, false);

      // if mailvelope is not present after 10sec we consider it absent
      setTimeout(() => {
        if (typeof window.mailvelope === 'undefined') {
          this.mailvelopeAbsent();
        }
      }, 3000);
    }
  }

  mailvelopeAbsent() {
    this.classList.remove('loading');
    let errorMsg;
    if (typeof window.mailvelope === 'undefined') {
      errorMsg = 'Mailvelope API is not included in the page.' + ' ' +
        'Please add the domain as email provider in the extension settings.';
      return this._onError(errorMsg);
    }
  }

  mailvelopeLoaded() {
    this.classList.remove('loading');
    let errorMsg;
    if (typeof window.mailvelope.createEncryptedFormContainer === 'undefined') {
      errorMsg = 'This version of Mailvelope API does not support encrypted forms.' + ' ' +
                 'Please update to the latest version of Mailvelope.';
      return this._onError(errorMsg);
    }

    let html = this.querySelector('form').outerHTML;
    if (typeof html === 'undefined') {
      errorMsg = 'No form data included in pgp-encrypted-form tag.';
      return this._onError(errorMsg);
    }

    let id = this.getAttribute('id');
    if (typeof id === 'undefined') {
      errorMsg = 'No form included in pgp-encrypted-tag. Please add form definition.';
      return this._onError(errorMsg);
    }

    let signature = this.getAttribute('signature');
    if (typeof signature === 'undefined') {
      errorMsg = 'No signature included in pgp-encrypted-tag. Please add a signature.';
      return this._onError(errorMsg);
    }

    window.mailvelope.createEncryptedFormContainer(id, html, signature)
      .then(() => {
        console.log('createEncryptedFormContainer response');
      });
  }

  // Invoked when the custom element is disconnected from the document's DOM.
  disconnectedCallback() {
    // console.log('PgpEncryptedForm::disconnectedCallback');
  }

  _onError(msg) {
    console.error(msg);
    this.innerHTML = '<div class="error-message">' + msg + '</div>';
  }

}

setTimeout(() => {
  window.customElements.define('pgp-encrypted-form', PgpEncryptedForm);
}, 500);

