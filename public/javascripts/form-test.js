$(document).ready(function() {
  let pgpFormDefined = false;
  let pgpForm = document.getElementById("examplePgpForm");

  function handleError(message) {
    $('<div/>', {class: 'error', text: message}).appendTo('#examplePgpForm');
    $('#examplePgpForm').addClass('error');
  }

  // Custom element events
  pgpForm.addEventListener('error', function (error) {
    $('#examplePgpForm').addClass('error').text(error.message);
  });

  pgpForm.addEventListener('onConnected', function () {
    console.log('connected');
    pgpFormDefined = true;
    $('#examplePgpForm').addClass('defined');
  });

  // Other events for demo/test // will be removed
  pgpForm.addEventListener('onSomething', function (event) {
    console.log('PageScript::something');
    console.log(event.detail.something);
  });

  pgpForm.addEventListener('onSomethingElse', function () {
    console.log('PageScript::somethingElse');
    console.log(this.somethingElse);
  });

  // Support check
  // if pgpForm is not connected after 10sec we consider it absent
  setTimeout(() => {
    if (!pgpFormDefined) {
      const errorMsg = 'OpenPGP Encrypted Form is not supported. Please install mailvelope and add this domain as an email provider.';
      handleError(errorMsg);
    } else {
      $('#examplePgpForm').addClass('defined');
    }
  }, 3000);

});
