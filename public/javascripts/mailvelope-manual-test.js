
$(document).ready(function() {
  if (typeof mailvelope !== 'undefined') {
    init();
  } else {
    document.addEventListener('mailvelope', init, false);
  }
});

function init() {
  
  $('#clearBtn').on('click', function() {
    $('#editor_cont, #display_cont').empty();
    $('#encryptBtn').off('click');
    $('#armored_msg').val('');
    initEditor();
  });

  $('#initEditorBtn').on('click', function() {
    $('#editor_cont').empty();
    $('#encryptBtn').off('click');
    initEditor();
  });

  var keyring = null;

  mailvelope.getKeyring('mailvelope').then(function(kr) {
    keyring = kr;
    initEditor();
  });

  function initEditor() {
    mailvelope.createEditorContainer('#editor_cont', keyring).then(function(editor) {
      $('#encryptBtn').on('click', function() {
        editor.encrypt(['test@mailvelope.com']).then(function(armored) {
          $('#armored_msg').val(armored);
        });
      });
    });
  }

  $('#decryptBtn').on('click', function() {
    $('#display_cont').empty();
    mailvelope.createDisplayContainer('#display_cont', $('#armored_msg').val(), keyring);
  });
}
