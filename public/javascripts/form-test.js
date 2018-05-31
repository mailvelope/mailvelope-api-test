$(document).ready(function() {

  $('html').removeClass('no-js');

  $('pgp-encrypted-form').each(function() {
    let pgpFormDefined = false;
    let pgpForm = this;

    function onError(message) {
      $('<div/>', {class: 'bg-danger message', text: message}).appendTo(pgpForm);
      $(pgpForm).addClass('error');
    }

    // Custom element events
    pgpForm.addEventListener('error', error => onError(error.message));

    pgpForm.addEventListener('connected', () => {
      pgpFormDefined = true;
      $(pgpForm).addClass('defined');
    });

    pgpForm.addEventListener('encrypt', event => {
      $(pgpForm).remove();
      const response = $('<pre/>').text(event.detail.armoredData);
      const success = $('<p/>', {class: 'message bg-success'})
        .text('Success: mailvelope api returned the following content');
      $('.container').append(success).append(response);
    });

    // Support check
    // if pgpForm is not connected after 10sec we consider it absent
    setTimeout(function() {
      if (!pgpFormDefined) {
        const errorMsg = 'OpenPGP Encrypted Form is not supported. Please install mailvelope and add this domain as an email provider.';
        onError(errorMsg);
      } else {
        $(pgpForm).addClass('defined');
      }
    }, 1000);
  });
});
