
mocha.setup('bdd');
mocha.timeout(20000);

var expect = chai.expect;

var pgp_key;
var pgp_msg;

$(document).ready(function() {
  $('#startBtn').on('click', function() {
    $('#setup').hide();
    mocha.run();
  });
  $.get('../data/key.asc', function(key) {
    pgp_key = key;
    var intro = '\n - Import the key below into Mailvelope before the test\n';
    intro += ' - Add localhost to watchlist with API flag activated\n\n';
    intro += pgp_key;
    $('#intro').val(intro);
  });
  $.get('../data/msg.asc', function(msg) {
    pgp_msg = msg;
  });
});

describe('Mailvelope API test', function() {

  before(function(done) {
    if (typeof mailvelope !== 'undefined') {
      done();
    } else {
      document.addEventListener('mailvelope', done.bind(null, null), false);
    }
  });

  describe('Version 1', function() {

    it('getVersion', function() {
      var version = mailvelope.getVersion();
      expect(version).to.exist;
      expect(/\d\.\d{1, 2}.\d{1, 2}/.test(version)).to.exist;
    });

    describe('Keyring', function() {

      var keyring = null;

      before(function(done) {
        mailvelope.getKeyring('mailvelope').then(function(kr) {
          expect(kr).to.exist;
          keyring = kr;
          done();
        }).catch(done);
      });

      it('getKeyring', function(done) {
        mailvelope.getKeyring('mailvelope').then(function(kr) {
          expect(kr).to.exist;
          done();
        }).catch(done);
      });

      it('getKeyring - no keyring found error', function(done) {
        mailvelope.getKeyring('bob@mailvelope.com').then(function(kr) {
          expect(kr).to.not.exist;
          done();
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('NO_KEYRING_FOR_ID');
          done();
        });
      });

      it('createKeyring', function(done) {
        var randomId = Math.random().toString(36).substr(2, 8);
        mailvelope.createKeyring(randomId).then(function(kr) {
          expect(kr).to.exist;
          done();
        }).catch(done);
      });

      it('createKeyring - if it does not exist', function(done) {
        mailvelope.getKeyring('test@mailvelope.com').then(function(kr) {
          expect(kr).to.exist;
          done();
        }, function(err) {
          if (err.code === 'NO_KEYRING_FOR_ID') {
            mailvelope.createKeyring('test@mailvelope.com').then(function(kr) {
              expect(kr).to.exist;
              done();
            });
          } else {
            throw err;
          }
        }).catch(done);
      });

      it('createKeyring - id already exists error', function(done) {
        mailvelope.createKeyring('test@mailvelope.com').then(function(kr) {
          expect(kr).to.not.exist;
          done();
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('KEYRING_ALREADY_EXISTS');
          done();
        });
      });

      it('validKeyForAddress', function(done) {
        keyring.validKeyForAddress(['test@mailvelope.com']).then(function(result) {
          expect(result).to.exist;
          expect(result).to.eql({'test@mailvelope.com': {}});
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
          expect(armored).to.not.exist;
          done();
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('NO_KEY_FOR_ADDRESS');
          done();
        });
      });

      it.skip('importPublicKey', function(done) {
        keyring.importPublicKey('test@mailvelope.com').then(function(result) {
          // TODO
          done();
        }).catch(done);
      });

    });

    describe('createDisplayContainer', function() {

      var keyring = null;

      before(function(done) {
        mailvelope.getKeyring('mailvelope').then(function(kr) {
          keyring = kr;
          done();
        }).catch(done);
      });

      it('createDisplayContainer', function(done) {
        mailvelope.createDisplayContainer('#test_display', pgp_msg, keyring).then(function() {
          expect($('#test_display iframe[src*="decryptInline"]').length).to.equal(1);
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
        mailvelope.getKeyring('mailvelope').then(function(kr) {
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
          console.log('editor', editor);
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
        mailvelope.getKeyring('mailvelope').then(function(kr) {
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

      it('invalid identifier', function(done) {
        mailvelope.getKeyring('|#|').catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('INVALID_IDENTIFIER');
          done();
        });
      });

    });

  });

});
