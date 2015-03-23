
$(document).ready(function() {
  if (typeof mailvelope !== 'undefined') {
    init();
  } else {
    window.addEventListener('mailvelope', init, false);
  }
});

function init() {
  
  $('#clearBtn').on('click', function() {
    $('#editor_cont, #display_cont').empty();
    $('#encryptBtn').off('click');
    $('#armored_msg, #encryptTime, #decryptTime, #armored_key').val('');
    initEditor();
  });

  $('#initEditorBtn').on('click', function() {
    $('#editor_cont').empty();
    $('#encryptBtn').off('click');
    $('#encryptTime').val('');
    initEditor();
  });

  var keyring = null;

  mailvelope.getKeyring('test.user').then(function(kr) {
    keyring = kr;
    initEditor();
  });

  function initEditor() {
    $.get('../data/msg.asc', function(msg) {
      mailvelope.createEditorContainer('#editor_cont', keyring, {
        predefinedText: 'This is a predefined text as in options.predefined',
        quotedMailHeader: 'On Feb 22, 2015 6:34 AM, "Test User" <test@mailvelope.com> wrote:',
        quotedMail: msg,
        quota: 32*1024*1024
      }).then(function(editor) {
        $('#encryptBtn').on('click', function() {
          var t0 = performance.now();
          editor.encrypt(['test@mailvelope.com']).then(function(armored) {
            $('#encryptTime').val(parseInt(performance.now() - t0));
            $('#armored_msg').val(armored);
          });
        });
      });
    });
  }

  $('#decryptBtn').on('click', function() {
    $('#display_cont').empty();
    var t0 = performance.now();
    mailvelope.createDisplayContainer('#display_cont', $('#armored_msg').val(), keyring).then(function() {
      $('#decryptTime').val(parseInt(performance.now() - t0));
    });
  });

  $('#importBtn').on('click', function() {
    keyring.importPublicKey($('#armored_key').val()).then(function(status) {
      $('#importStatus').val(status);
    }).catch(function(error) {
      console.log('Import error', error);
    });
  });

}
