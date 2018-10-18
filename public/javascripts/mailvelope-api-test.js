
mocha.setup('bdd');
mocha.timeout(20000);

var expect = chai.expect;

var pgp_key;
var pgp_msg;

$(document).ready(function() {
  $('#startBtn').on('click', function() {
    $('#setup').hide();
  });
  $.get('../data/key.asc', function(key) {
    pgp_key = key;
    $.get('../data/msg.asc', function(msg) {
      pgp_msg = msg;
      mocha.run();
    });
  });
});

describe('Mailvelope API test', function() {

  before(function(done) {
    if (typeof mailvelope !== 'undefined') {
      done();
    } else {
      window.addEventListener('mailvelope', done.bind(null, null), false);
    }
  });

  describe('Version 1', function() {

    it('getVersion', function(done) {
      mailvelope.getVersion().then(function(version) {
        expect(version).to.exist;
        expect(/\d\.\d{1,2}\.\d{1,2}(b\d)?/.test(version)).to.be.true;
        done();
      }).catch(done);
    });

    describe('Keyring', function() {

      var keyring = null;
      var randomId = Math.random().toString(36).substr(2, 8);

      it('getKeyring', function(done) {
        mailvelope.getKeyring('test.user').then(function(kr) {
          expect(kr).to.exist;
          keyring = kr;
          done();
        }).catch(done);
      });

      it('getKeyring - no keyring found error', function(done) {
        mailvelope.getKeyring(randomId).then(function(kr) {
          throw new Error('Should not enter then method.');
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('NO_KEYRING_FOR_ID');
          done();
        });
      });

      it('createKeyring - if it does not exist', function(done) {
        mailvelope.getKeyring('bob@mailvelope.com').then(function(kr) {
          expect(kr).to.exist;
          done();
        }, function(err) {
          if (err.code === 'NO_KEYRING_FOR_ID') {
            mailvelope.createKeyring('bob@mailvelope.com').then(function(kr) {
              expect(kr).to.exist;
              done();
            });
          } else {
            throw err;
          }
        }).catch(done);
      });

      it('createKeyring - id already exists error', function(done) {
        mailvelope.createKeyring('bob@mailvelope.com').then(function(kr) {
          throw new Error('Should not enter then method.');
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('KEYRING_ALREADY_EXISTS');
          done();
        });
      });

      it('validKeyForAddress', function(done) {
        keyring.validKeyForAddress(['test@mailvelope.com']).then(function(result) {
          expect(result).to.exist;
          var found = false;
          result['test@mailvelope.com'].keys.forEach(function(key) {
            if (key.fingerprint === 'aa1e01774bdf7d76a45bdc2df11db1250c3c3f1b') {
              found = true;
            }
          });
          expect(found).to.be.true;
          done();
        }).catch(done);
      });

      it('exportOwnPublicKey', function(done) {
        keyring.exportOwnPublicKey('test@mailvelope.com').then(function(armored) {
          expect(armored).to.exist;
          expect(armored).to.match(/-----BEGIN PGP PUBLIC KEY BLOCK-----/);
          done();
        }).catch(done);
      });

      it('exportOwnPublicKey - no key for this address error', function(done) {
        keyring.exportOwnPublicKey('abc@mailvelope.com').then(function(armored) {
          throw new Error('Should not enter then method.');
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('NO_KEY_FOR_ADDRESS');
          done();
        });
      });

      it.skip('importPublicKey', function(done) {
        keyring.exportOwnPublicKey('test@mailvelope.com').then(function(armored) {
          expect(armored).to.exist;
          keyring.importPublicKey(armored).then(function(status) {
            expect(['IMPORTED', 'UPDATED', 'INVALIDATED']).to.contain(status);
            done();
          });
        }).catch(done);
      });

      it('setLogo', function(done) {
        var logoRev = keyring.logoRev;
        keyring.setLogo('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABgCAIAAABaGO0eAAAAnklEQVR42u3RAQ0AMAjAsHMN2EYHNpFBQjoJa2TX017fAgAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQgAsNulgCCPJ2zM0AAAAASUVORK5CYII=', logoRev + 1).then(function() {
          expect(keyring.logoRev).to.equal(logoRev + 1);
          done();
        }).catch(done);
      });

      it.skip('setLogo - wrong revision', function(done) {
        var logoRev = keyring.logoRev;
        keyring.setLogo('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAABg', logoRev).then(function() {
          throw new Error('Should not enter then method.');
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('REVISION_INVALID');
          done();
        });
      });

      it('hasPrivateKey', function() {
        return keyring.hasPrivateKey('aa1e01774bdf7d76a45bdc2df11db1250c3c3f1b')
        .then(function(result) {
          expect(result).to.be.true;
        });
      });

      it('hasPrivateKey - has not', function() {
        return keyring.hasPrivateKey('9400a492b06bfaed38dad7ece1059060cbb71881')
        .then(function(result) {
          expect(result).to.be.false;
        });
      });

      it('addSyncHandler', function() {

        var syncHandlerObj = {
          uploadSync: function(syncObj) {
            console.log('uploadSync handler', syncObj);
            return Promise.resolve();
          },

          downloadSync: function(syncObj) {
            console.log('downloadSync handler', syncObj);
            return Promise.resolve();
          },

          backup: function(syncObj) {
            console.log('backup handler', syncObj);
            return Promise.resolve();
          },

          restore: function() {
            consoloe.log('restore handler');
            return Promise.resolve();
          }
        };

        return keyring.addSyncHandler(syncHandlerObj)
        .then(function(result) {
          expect(result).to.be.undefined;
        });
      });
    });

    describe('createDisplayContainer', function() {

      var keyring = null;

      before(function(done) {
        mailvelope.getKeyring('test.user').then(function(kr) {
          keyring = kr;
          done();
        }).catch(done);
      });

      it('createDisplayContainer', function(done) {
        mailvelope.createDisplayContainer('#test_display', pgp_msg, keyring).then(function() {
          expect($('#test_display iframe[src*="decryptMessage"]').length).to.equal(1);
          done();
        }).catch(done);
      });

      it('error in armored block', function(done) {
        mailvelope.createDisplayContainer('#test_display', '123', keyring).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('WRONG_ARMORED_TYPE');
          done();
        }).catch(done);
      });

      it('wrong selector', function(done) {
        mailvelope.createDisplayContainer('#123', pgp_msg, keyring).catch(function(err) {
          expect(err).to.exist;
          done();
        }).catch(done);
      });

    });

    describe('createEditorContainer', function() {

      var keyring = null;

      before(function(done) {
        mailvelope.getKeyring('test.user').then(function(kr) {
          keyring = kr;
          done();
        }).catch(done);
      });

      beforeEach(function() {
        $('#test_editor').empty();
      });

      it('createEditorContainer', function(done) {
        mailvelope.createEditorContainer('#test_editor', keyring).then(function(editor) {
          expect(editor).to.exist;
          expect($('#test_editor iframe[src*="editor"]').length).to.equal(1);
          done();
        }).catch(done);
      });

      it('Editor.encrypt', function(done) {
        mailvelope.createEditorContainer('#test_editor', keyring).then(function(editor) {
          return editor.encrypt(['test@mailvelope.com']);
        }).then(function(armored) {
          expect(armored).to.match(/-----BEGIN PGP MESSAGE-----/);
          done();
        }).catch(done);
      });

      it('Editor.encrypt - encryption in progress error', function(done) {
        mailvelope.createEditorContainer('#test_editor', keyring).then(function(editor) {
          editor.encrypt(['test@mailvelope.com']);
          return editor.encrypt(['test@mailvelope.com']);
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('ENCRYPT_IN_PROGRESS');
          done();
        }).catch(done);
      });

    });

    describe('createSettingsContainer', function() {

      it.skip('createSettingsContainer', function(done) {
        mailvelope.createSettingsContainer('#test_settings', keyring).then(function() {
          expect($('#test_display iframe[src*="decryptInline"]').length).to.equal(1);
          done();
        }).catch(done);
      });

    });

    describe('Type checking', function() {

      var keyring = null;

      before(function(done) {
        mailvelope.getKeyring('test.user').then(function(kr) {
          keyring = kr;
          done();
        }).catch(done);
      });

      it('wrong selector parameter type', function(done) {
        mailvelope.createDisplayContainer(new Date(), pgp_msg, keyring).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('TYPE_MISMATCH');
          done();
        });
      });

      it('wrong armored block parameter type', function(done) {
        mailvelope.createDisplayContainer('#test_display', {1: 2}, keyring).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('TYPE_MISMATCH');
          done();
        });
      });

      it('invalid keyring type', function(done) {
        mailvelope.createDisplayContainer('#test_display', pgp_msg, '123').catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('TYPE_MISMATCH');
          done();
        });
      });

      it('invalid identifier', function(done) {
        mailvelope.getKeyring('|#|').catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('INVALID_IDENTIFIER');
          done();
        });
      });

    });

  });

  after(function() {
    $('#back').show();
  });

});
