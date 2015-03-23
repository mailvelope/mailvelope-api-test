
$(document).ready(function() {

  $.get('../data/key.asc', function(key) {
    var intro = '\n => Open the Mailvelope settings, switch to keyring \'demo.mailvelope.com (test.user)\' and import the key below before starting the test\n\n';
    intro += key;
    $('#intro').val(intro);
    $('a.btn').removeClass('disabled');
  });

  if (typeof mailvelope !== 'undefined') {
    initKeyring();
  } else {
    window.addEventListener('mailvelope', initKeyring.bind(null, null), false);
  }

  function initKeyring() {
    mailvelope.createKeyring('test.user').catch(function() {
      // KEYRING_ALREADY_EXISTS
    });
  }

}); 
