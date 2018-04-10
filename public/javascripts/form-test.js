$(document).ready(function() {

  $('pgp-encrypted-form').each(function() {
    let pgpFormDefined = false;
    let pgpForm = this;

    function handleError(message) {
      $('<div/>', {class: 'error', text: message}).appendTo(this);
      $(this).addClass('error');
    }

    // Custom element events
    pgpForm.addEventListener('error', function (error) {
      console.log(error);
      $(this).remove();
      const $error = $('<p/>', {
        class: 'bg-danger',
        style: 'padding:1em'
      }).text(error.message);
      $('.container').append($error);
    });

    pgpForm.addEventListener('connected', function () {
      pgpFormDefined = true;
      $(this).addClass('defined');
    });

    pgpForm.addEventListener('encrypt', function (event) {
      $(this).remove();
      const response = $('<pre/>').text(event.detail.armoredData);
      const success = $('<p/>', {
        class: 'bg-success',
        style: 'padding:1em'
      }).text('Success: mailvelope api returned the following content');
      $('.container').append(success).append(response);
    });

    // Support check
    // if pgpForm is not connected after 10sec we consider it absent
    setTimeout(() => {
      if (!pgpFormDefined) {
        const errorMsg = 'OpenPGP Encrypted Form is not supported. Please install mailvelope and add this domain as an email provider.';
        handleError(errorMsg);
      } else {
        $(this).addClass('defined');
      }
    }, 3000);
  });
});
