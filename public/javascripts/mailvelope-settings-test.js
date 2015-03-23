
$(document).ready(function() {
  if (typeof mailvelope !== 'undefined') {
    init();
  } else {
    window.addEventListener('mailvelope', init, false);
  }
});

function init() {

  $('#openSettings').on('click', function() {
    $('#settings').empty();
    mailvelope.createKeyring('test@gmx.de-mail.de').then(function(keyring) {
      mailvelope.createSettingsContainer('#settings', keyring, {email: "test@gmx.de-mail.de", fullName: "John Smith"});
    });
  });

}
