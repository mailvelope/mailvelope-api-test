
$(document).ready(function() {
  if (typeof mailvelope !== 'undefined') {
    init();
  } else {
    window.addEventListener('mailvelope', init, false);
  }
  window.addEventListener('mailvelope-disconnect', function(event) {
    $('#newVersion').val(event.detail.version);
    $('#disconnectModal').modal('show');
  }, false);
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
  var senderAddress = 'test@mailvelope.com';
  var recipient = 'test@mailvelope.com';
  var uploadLimit = 10;

  mailvelope.getKeyring('test.user').then(function(kr) {
    keyring = kr;
    initEditor({signAndEncrypt: true});
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
        console.log('uploadSync handler', syncObj);
        return new Promise(function(resolve, reject) {
          if ($('#uploadBackupFail').is(':checked')) {
            console.log('uploadSync reject');
            reject(new Error('Upload sync error simulation'));
            return;
          }
          if (syncObj.eTag != $('#eTag').val()) {
            console.log('uploadSync eTag mismatch');
            reject(new Error('Upload sync error: eTag mismatch'));
            return;
          }
          var eTag = getHash();
          $('#eTag').val(eTag);
          $('#backupServerSync').val(syncObj.keyringMsg);
          console.log('uploadSync resolve');
          resolve({eTag: eTag});
        });
      },

      /**
       * Download the public keyring from the backend server
       * @param syncObj
       */
      downloadSync: function(syncObj) {
        console.log('downloadSync handler', syncObj);
        return new Promise(function(resolve, reject) {
          if ($('#downloadBackupFail').is(':checked')) {
            console.log('downloadSync reject');
            reject(new Error('Download sync error simulation'));
            return;
          }
          if (syncObj.eTag == $('#eTag').val()) {
            console.log('Download sync equal eTag - no download');
            resolve({eTag: $('#eTag').val()});
            return;
          }
          console.log('downloadSync resolve');
          resolve({eTag: $('#eTag').val(), keyringMsg: $('#backupServerSync').val()});
        });
      },

      /**
       * Backup private key
       * @param syncObj
       */
      backup: function(syncObj) {
        console.log('backup handler', syncObj);
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
        console.log('restore handler');
        return new Promise(function(resolve, reject) {
          if (keyBackup) {
            resolve(keyBackup);
          } else {
            reject(new Error('No key backup available.'));
          }
        });
      }
    };
    keyring.addSyncHandler(syncHandlerObj)
      .then(function() {
        console.log('keyring.addSyncHandler success');
      })
      .catch(function(error) {
        console.log('keyring.addSyncHandler error', error);
      });
  }

  function getSenderAddress () {
    var address = $('#senderAddress').val();

    if(address === '') {
      return senderAddress
    }
    return address;
  }

  function getRecipient () {
    var address = $('#toAddress').val();

    if(address === '') {
      return recipient;
    }
    return address;
  }

  /**
   * @param {Object} [options]
   * @param {Boolean} [options.signAndEncrypt] default: false
   */
  function initEditor(options) {
    var $encryptBtn = $('#encryptBtn');
    var $editorCont = $('#editorCont');
    var $encryptTime = $('#encryptTime');
    var $armored_msg = $('#armored_msg');

    var signAndEncrypt = (options && options.signAndEncrypt) || false;

    $.get('../data/msg.asc', function(msg) {

      $editorCont.empty();
      $encryptBtn.off('click');
      $armored_msg.val('');
      $encryptTime.val('');

      mailvelope.createEditorContainer('#editorCont', keyring, {
        predefinedText: 'This is a predefined text as in options.predefined',
        quotedMailHeader: 'On Feb 22, 2015 6:34 AM, "Test User" <test@mailvelope.com> wrote:',
        quotedMail: msg,
        quota: uploadLimit * 1024,
        signMsg: signAndEncrypt,
        keepAttachments: true
      }).then(function(editor) {
        $encryptBtn.on('click', function() {
          console.log('encryptBtn click');
          var t0 = performance.now();

          editor.encrypt([getRecipient()])
            .then(function(armored) {
              console.log('editor.encrypt() success', armored);
              $encryptTime.val(parseInt(performance.now() - t0));
              $armored_msg.val(armored);
            })
            .catch(function(error) {
              console.log('editor.encrypt() error', error);
            });
        });
      });
    });
  }

  $('#toggleEditor').bootstrapSwitch({
    labelText: 'Sign',
    onSwitchChange: function(evt, state) {
      initEditor({signAndEncrypt: state});
    }
  });

  $('#generateEtagBtn').on('click', function() {
    console.log('generateEtagBtn click');
    $('#eTag').val(getHash());
  });

  $('#decryptBtn').on('click', function() {
    $('#display_cont').empty();
    var t0 = performance.now();
    var options = { senderAddress: getSenderAddress() };

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
        email: senderAddress,
        fullName: 'Generated on ' + (new Date()).toLocaleString()
      },
      {
        email: 'second@mailvelope.com',
        fullName: 'Second User'
      }],
      keySize: 4096
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

    keyring.restoreBackupContainer('#private_key_backup_cont')
      .then(function(restoreBackup) {
        console.log('keyring.restoreBackupContainer success', restoreBackup);

        restoreBackup.isReady()
          .then(function(result) {
            console.log('restoreBackup.isReady success', result);
          })
          .catch(function(error) {
            console.log('restoreBackup.isReady error', error);
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

        mailvelope.createSettingsContainer('#settings', keyring, {email: 'test@gmx.de-mail.de', fullName: 'John Smith'})
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

            mailvelope.createSettingsContainer('#settings', keyring, {email: 'test@gmx.de-mail.de', fullName: 'John Smith'})
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


/**
 * Helper area
 */
function getHash() {
  var result = '';
  var buf = new Uint16Array(2);
  window.crypto.getRandomValues(buf);
  for (var i = 0; i < buf.length; i++) {
    result += buf[i].toString(16);
  }
  return result;
};
