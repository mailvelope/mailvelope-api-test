
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
    mailvelope.getKeyring('mailvelope').then(function(keyring) {
      mailvelope.createSettingsContainer('#settings', keyring, {email: "john.smith@test.com", fullName: "John Smith"});
    });
  });

}
