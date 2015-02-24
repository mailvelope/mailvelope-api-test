
$(document).ready(function() {
  if (typeof mailvelope !== 'undefined') {
    init();
  } else {
    document.addEventListener('mailvelope', init, false);
  }
});

function init() {

  $('#openSettings').on('click', function() {
    $('#settings').empty();
    mailvelope.getKeyring('mailvelope').then(function(keyring) {
      mailvelope.createSettingsContainer('#settings', keyring);
    });
  });

}