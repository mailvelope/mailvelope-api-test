
function init() {
  $.get('../data/key.asc', key => {
    var intro = '\n => Open the Mailvelope settings, switch to keyring \'demo.mailvelope.com (test.user)\' and import the key below before starting the test\n\n';
    intro += key;
    $('#intro').val(intro);
    $('a.btn').removeClass('disabled');
  });

  if (typeof mailvelope !== 'undefined') {
    initKeyring();
  } else {
    window.addEventListener('mailvelope', initKeyring);
  }
}

function initKeyring() {
  mailvelope.createKeyring('test.user')
  .then(keyring => {
    $.get('../data/keyring_logo.base64', logo => keyring.setLogo(`data:image/png;base64,${logo}`, 1));
  })
  .catch(() => {
    // KEYRING_ALREADY_EXISTS
  });
}

$(document).ready(init);
