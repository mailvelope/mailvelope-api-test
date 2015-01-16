
mocha.setup('bdd');
mocha.timeout(20000);

var expect = chai.expect;

var pgp_key;

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
});

describe('Mailvelope API test', function() {

  var pgp_msg;

  before(function(done) {
    if (typeof mailvelope !== 'undefined') {
      done();
    } else {
      document.addEventListener('mailvelope', done.bind(null, null), false);
    }
  });

  before(function(done) {
    $.get('../data/msg.asc', function(msg) {
      pgp_msg = msg;
      done();
    });
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
        mailvelope.getKeyring('test@mailvelope.com').then(function(kr) {
          expect(kr).to.exist;
          keyring = kr;
          done();
        }).catch(done);
      });

      it.skip('getKeyring', function(done) {
        mailvelope.getKeyring('test@mailvelope.com').then(function(keyring) {
          // TODO
          expect(keyring).to.exist;
          done();
        }).catch(done);
      });

      it.skip('createKeyring', function(done) {
        mailvelope.createKeyring('test@mailvelope.com').then(function(keyring) {
          // TODO
          expect(keyring).to.exist;
          done();
        }).catch(done);
      });

      it('getKeyInfoForAddress', function(done) {
        keyring.getKeyInfoForAddress(['test@mailvelope.com']).then(function(result) {
          expect(result).to.exist;
          expect(result).to.eql({'test@mailvelope.com': {}});
          done();
        }).catch(done);
      });

      it('exportOwnPublicKey', function(done) {
        keyring.exportOwnPublicKey('test@mailvelope.com').then(function(result) {
          expect(result).to.exist;
          expect(result).to.match(/-----BEGIN PGP PUBLIC KEY BLOCK-----/);
          done();
        }).catch(done);
      });

      it.skip('importPublicKey', function(done) {
        keyring.importPublicKey('test@mailvelope.com').then(function(result) {
          // TODO
          done();
        }).catch(done);
      });

    });

    describe('createDisplayContainer', function() {

      it('createDisplayContainer', function(done) {
        mailvelope.createDisplayContainer('#test_display', pgp_msg).then(function() {
          expect($('#test_display iframe[src*="decryptInline"]').length).to.equal(1);
          done();
        }).catch(done);
      });

      it('error armored', function(done) {
        mailvelope.createDisplayContainer('#test_display', '123').catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('WRONG_ARMORED_TYPE');
          done();
        }).catch(done);
      });

      it('wrong selector', function(done) {
        mailvelope.createDisplayContainer('#123', pgp_msg).catch(function(err) {
          expect(err).to.exist;
          done();
        }).catch(done);
      });

    });

    describe('createEditorContainer', function() {

      beforeEach(function() {
        $('#test_editor').empty();
      });

      it('createEditorContainer', function(done) {
        mailvelope.createEditorContainer('#test_editor').then(function(editor) {
          expect(editor).to.exist;
          expect($('#test_editor iframe[src*="editor"]').length).to.equal(1);
          done();
        }).catch(done);
      });

      it('Editor.encrypt', function(done) {
        mailvelope.createEditorContainer('#test_editor').then(function(editor) {
          console.log('editor', editor);
          return editor.encrypt(['test@mailvelope.com']);
        }).then(function(armored) {
          expect(armored).to.match(/-----BEGIN PGP MESSAGE-----/);
          done();
        }).catch(done);
      });

      it('Editor.encrypt empty recipients array', function(done) {
        mailvelope.createEditorContainer('#test_editor').then(function(editor) {
          return editor.encrypt([]);
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('NO_RECIPIENTS');
          done();
        }).catch(done);
      });

      it('Editor.encrypt encryption in progress', function(done) {
        mailvelope.createEditorContainer('#test_editor').then(function(editor) {
          editor.encrypt(['test@mailvelope.com']);
          return editor.encrypt(['test@mailvelope.com']);
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('ENCRYPT_IN_PROGRESS');
          done();
        }).catch(done);
      });

      it('Editor.encrypt call multiple times', function(done) {
        mailvelope.createEditorContainer('#test_editor').then(function(editor) {
          return editor.encrypt(['test@mailvelope.com']).then(function(armored) {
            return editor.encrypt(['test@mailvelope.com']);
          });
        }).catch(function(err) {
          expect(err).to.exist;
          expect(err.code).to.equal('CALL_LIMIT_EXCEEDED');
          done();
        }).catch(done);
      });

    });

    describe('createSettingsContainer', function() {

      it.skip('createSettingsContainer', function(done) {
        mailvelope.createDisplayContainer('#test_display', pgp_msg).then(function() {
          expect($('#test_display iframe[src*="decryptInline"]').length).to.equal(1);
          done();
        }).catch(done);
      });

    });

  });

});
