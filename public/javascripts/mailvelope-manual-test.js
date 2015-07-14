
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

  $('.panel .nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show')
  });

  $(function () {
    $('[data-toggle=tooltip]').tooltip()
  });

  var keyring = null;
  var senderAdress = 'test@mailvelope.com';

  mailvelope.getKeyring('test.user').then(function(kr) {
    keyring = kr;
    initEditor();
    initSync();
  });

  var keyBackup = null;

  function initSync() {
    var syncHandlerObj = {
      /**
       * Upload the public keyring to the backend server
       * @param syncObj
       */
      uploadSync: function(syncObj) {
        console.log('callback', syncObj);
        return new Promise(function(resolve, reject) {
          resolve({});
        });
      },

      /**
       * Download the public keyring from the backend server
       * @param syncObj
       */
      downloadSync: function(syncObj) {
        console.log('downloadSync callback', syncObj);
        return new Promise(function(resolve, reject) {
          resolve({});
        });
      },

      /**
       * Backup private key
       * @param syncObj
       */
      backup: function(syncObj) {
        console.log('backup callback', syncObj);
        return new Promise(function(resolve, reject) {
          keyBackup = syncObj;
          resolve();
          //reject(new Error('Network error'));
        });
      },

      /**
       * Restore private key backup
       */
      restore: function() {
        return new Promise(function(resolve, reject) {
          if (keyBackup) {
            resolve({ backup: keyBackup });
          } else {
            reject(new Error('No key backup available.'));
          }
        });
      }
    };
    keyring.addSyncHandler(syncHandlerObj)
      .then(function(result) {
        console.log('keyring.addSyncHandler success', result);
      })
      .catch(function(error) {
        console.log('keyring.addSyncHandler error', error);
      });
  }

  function initEditor() {
    $.get('../data/msg.asc', function(msg) {
      mailvelope.createEditorContainer('#signEditorCont', keyring, {
        predefinedText: 'This is a predefined text as in options.predefined',
        quotedMailHeader: 'On Feb 22, 2015 6:34 AM, "Test User" <test@mailvelope.com> wrote:',
        quotedMail: msg,
        quota: 25 * 1024,
        signMsg: true
      }).then(function(editor) {
        $('#signEncryptBtn').on('click', function() {
          console.log('signEncryptBtn click');
          var t0 = performance.now();
          editor.encrypt(['test@mailvelope.com'])
            .then(function(armored) {
              console.log('editor.encrypt() success', armored);
              $('#encryptTime').val(parseInt(performance.now() - t0));
              $('#armored_msg').val(armored);
            })
            .catch(function(error) {
              console.log('editor.encrypt() error', error);
            });
        });
      });
      mailvelope.createEditorContainer('#notSignEditorCont', keyring, {
        predefinedText: 'This is a predefined text as in options.predefined',
        quotedMailHeader: 'On Feb 22, 2015 6:34 AM, "Test User" <test@mailvelope.com> wrote:',
        quotedMail: msg,
        quota: 25 * 1024,
        signMsg: false
      }).then(function(editor) {
        $('#notSignEncryptBtn').on('click', function() {
          console.log('notSignEncryptBtn click');
          var t0 = performance.now();
          editor.encrypt([senderAdress])
            .then(function(armored) {
              console.log('editor.encrypt() success', armored);
              $('#encryptTime').val(parseInt(performance.now() - t0));
              $('#armored_msg').val(armored);
            })
            .catch(function(error) {
              console.log('editor.encrypt() error', error);
            });
        });
      });
    });
  }

  $('#decryptBtn').on('click', function() {
    $('#display_cont').empty();
    var t0 = performance.now();
    var options = { senderAddress: senderAdress };

    mailvelope.createDisplayContainer('#display_cont', $('#armored_msg').val(), keyring, options).then(function() {
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

  $('#createKeyGenGeneratorBtn').on('click', function() {
    console.log('#createKeyGenGeneratorBtn click');

    $('#private_key_backup_cont').empty();

    var options = {
      userIds: [{
        email: 'test@mailvelope.com',
        fullName: 'Generated on ' + (new Date()).toLocaleString()
      },
      {
        email: 'second@mailvelope.com',
        fullName: 'Second User'
      }],
      keySize: 2048
    };

    keyring.createKeyGenContainer('#private_key_backup_cont', options)
      .then(function(generator) {
        console.log('keyring.createKeyGenContainer success', generator);

        $('#generateGeneratorBtn')
          .removeAttr('disabled')
          .addClass('btn-success')
          .on('click', function() {

            $('#generateGeneratorBtn')
              .attr('disabled', true)
              .removeClass('btn-success');

            generator.generate()
              .then(function(result) {
                console.log('generator.generate success', result);
                $('#private_key_backup_cont').empty();
                $('#generateGeneratorBtn')
                  .removeAttr('disabled')
                  .addClass('btn-success');
              })
              .catch(function(error) {
                console.log('generator.generate error', error);

                $('#generateGeneratorBtn')
                  .removeAttr('disabled')
                  .addClass('btn-success');
              });
          });
      })
      .catch(function(error) {
        console.log('keyring.createKeyGenContainer error', error);
      });
  });

  $('#createKeyBackupContainerBtn').on('click', function() {
    console.log('#createKeyBackupContainerBtn click');
    var options = {
      initialSetup: true
    };

    $('#private_key_backup_cont').empty();

    keyring.createKeyBackupContainer('#private_key_backup_cont', options)
      .then(function(popup) {
        console.log('keyring.createKeyBackupContainer success', popup);

        popup.isReady()
          .then(function(result) {
            console.log('popup.isReady success', result);
            $('#private_key_backup_cont').empty();
          })
          .catch(function(error) {
            console.log('popup.isReady error', error);
            keyBackup = null;
          });
      })
      .catch(function(error) {
        console.log('keyring.createKeyBackupContainer error', error);
      });

  });

  $('#recreateKeyBackupContainerBtn').on('click', function() {
    console.log('#recreateKeyBackupContainerBtn click');
    var options = {
      initialSetup: false
    };

    $('#private_key_backup_cont').empty();

    keyring.createKeyBackupContainer('#private_key_backup_cont', options)
      .then(function(popup) {
        console.log('keyring.createKeyBackupContainer success', popup);

        popup.isReady()
          .then(function(result) {
            console.log('popup.isReady success', result);
            $('#private_key_backup_cont').empty();
          })
          .catch(function(error) {
            console.log('popup.isReady error', error);
            keyBackup = null;
          });
      })
      .catch(function(error) {
        console.log('keyring.createKeyBackupContainer error', error);
      });
  });

  $('#restoreBackupContainerBtn').on('click', function() {
    console.log('#restoreBackupContainerBtn click');

    $('#private_key_backup_cont').empty();

    var options = {
      restorePassword: false
    };
    keyring.restoreBackupContainer('#private_key_backup_cont', options)
      .then(function(restoreBackup) {
        console.log('keyring.restoreBackupContainer success', restoreBackup);

        restoreBackup.isReady()
          .then(function(result) {
            console.log('restoreBackup.isReady success', result);
          })
          .catch(function(error) {
            console.log('restoreBackup.isReady error', error);
          })
          .then(function() {
            $('#private_key_backup_cont').empty();
          });
      })
      .catch(function(error) {
        console.log('keyring.restoreBackupContainer error', error);

        $('#private_key_backup_cont').empty();
      });
  });

  $('#restorePasswordContainerBtn').on('click', function() {
    console.log('#restorePasswordContainerBtn click');

    $('#private_key_backup_cont').empty();

    var options = {
      restorePassword: true
    };
    keyring.restoreBackupContainer('#private_key_backup_cont', options)
      .then(function(restoreBackup) {
        console.log('keyring.restoreBackupContainer success', restoreBackup);

        restoreBackup.isReady()
          .then(function(result) {
            console.log('restoreBackup.isReady success', result);
          })
          .catch(function(error) {
            console.log('restoreBackup.isReady error', error);
          })
          .then(function() {
            //$('#private_key_backup_cont').empty();
          });
      })
      .catch(function(error) {
        console.log('keyring.restoreBackupContainer error', error);

        $('#private_key_backup_cont').empty();
      });
  });

  $('#hasPrivateKeyBtn').on('click', function() {
    var fingerprint = $('#fingerprintInput').val();

    keyring.hasPrivateKey(fingerprint)
      .then(function(result) {
        console.log('keyring.hasPrivateKey success', result);
        if (result) {
          $('#hasPrivateKey_cont').html('TRUE');
        } else {
          $('#hasPrivateKey_cont').html('FALSE');
        }
      })
  });

  $('#openSettingsBtn').on('click', function() {
    keyring.openSettings()
      .then(function(result) {
        console.log('keyring.openSettings() success', result);
      })
      .catch(function(error) {
        console.log('keyring.openSettings() error', error);
      })
  });

  $('#openIframeSettingsBtn').on('click', function() {
    console.log('#openIframeSettingsBtn click');

    $('#settings').empty();

    mailvelope.getKeyring('test@gmx.de-mail.de')
      .then(function(keyring) {
        console.log('mailvelope.getKeyring(test@gmx.de-mail.de) succcess', keyring);

        mailvelope.createSettingsContainer('#settings', keyring, {email: "test@gmx.de-mail.de", fullName: "John Smith"})
          .then(function(result) {
            console.log('mailvelope.createSettingsContainer() success', result);
          })
          .catch(function(error) {
            console.log('mailvelope.createSettingsContainer() error', error);
          });
      })
      .catch(function(error) {
        console.log('mailvelope.getKeyring(test@gmx.de-mail.de) error', error);

        mailvelope.createKeyring('test@gmx.de-mail.de')
          .then(function(keyring) {
            console.log('mailvelope.createKeyring(test@gmx.de-mail.de) success', keyring);

            mailvelope.createSettingsContainer('#settings', keyring, {email: "test@gmx.de-mail.de", fullName: "John Smith"})
              .then(function(result) {
                console.log('mailvelope.createSettingsContainer() success', result);
              })
              .catch(function(error) {
                console.log('mailvelope.createSettingsContainer() error', error);
              });
          })
          .catch(function(error) {
            console.log('mailvelope.createKeyring(test@gmx.de-mail.de) error', error);
          });
      });
  });
}
