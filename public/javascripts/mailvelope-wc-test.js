
'use strict';

let pgp_msg;
let senderAddress = 'test@mailvelope.com';
let recipient = 'test@mailvelope.com';
let uploadLimit = 50;
let draft_msg = '';
let armored_msg = '';
let editor = null;

function load() {
  $.get('../data/msg.asc', function(msg) {
    pgp_msg = msg;
    init();
  });
}

function getSenderAddress () {
  return $('#senderAddress').val() || senderAddress;
}

function getRecipient () {
  return $('#toAddress').val() || recipient;
}

function init() {
  $('#clearBtn').on('click', () => {
    $('#editor_cont, #display_cont').empty();
    $('#encryptTime, #decryptTime').val('');
    initEditor();
  });
  $('#restoreDraftBtn').on('click', () => {
    $('#editor_cont').empty();
    $('#encryptTime').val('');
    initEditor({restoreDraft: true, signAndEncrypt: true});
  });
  $('#encryptBtn').on('click', () => {
    console.log('encryptBtn click');
    let t0 = performance.now();
    editor.encrypt([getRecipient()])
    .then(armored => {
      console.log('editor.encrypt() success', armored);
      $('#encryptTime').val(parseInt(performance.now() - t0));
      armored_msg = armored;
    })
    .catch(error => {
      console.log('editor.encrypt() error', error);
    });
  });
  $('#draftBtn').on('click', () => {
    console.log('draftBtn click');
    let t0 = performance.now();
    editor.createDraft()
    .then(armored => {
      console.log('editor.createDraft() success', armored);
      $('#encryptTime').val(parseInt(performance.now() - t0));
      draft_msg = armored;
    })
    .catch(error => {
      console.log('editor.createDraft() error', error);
    });
  });
  $('#decryptBtn').on('click', () => {
    $('#display_cont').empty();
    const t0 = performance.now();
    const emailRead = $('<openpgp-email-read />', {
      id: 'decryptEmail1',
      'data-sender-address': getSenderAddress()
    });
    const armoredTemplate = $('<template />', {
      class: 'armored'
    });
    armoredTemplate.text(armored_msg);
    emailRead.append(armoredTemplate);
    emailRead.on('ready', () => {
      $('#decryptTime').val(parseInt(performance.now() - t0));
    });
    $('#display_cont').append(emailRead);
  });
  initEditor({signAndEncrypt: true});
}

/**
 * @param {Object} [options]
 * @param {Boolean} [options.signAndEncrypt] default: false
 * @param {Boolean} [options.restoreDraft]
 */
async function initEditor({signAndEncrypt = false, restoreDraft} = {}) {
  $('#editorCont').empty();
  armored_msg = '';
  $('#encryptTime').val('');
  const emailWrite = $('<openpgp-email-write />', {
    id: 'encryptEmail1',
    'data-quota': uploadLimit * 1024,
    'data-sign-msg': signAndEncrypt ? '' : undefined,
    ...restoreDraft ? {} : {
      'data-predefined-text': 'This is a predefined text as in attribute data-predefined-text',
      'data-quoted-mail-header': `On ${new Date()}, "Test User" <test@mailvelope.com> wrote:`,
      'data-keep-attachments': ''
    }
  });
  if (restoreDraft) {
    const armoredDraftTemplate = $('<template />', {
      class: 'armored-draft'
    });
    armoredDraftTemplate.text(draft_msg);
    emailWrite.append(armoredDraftTemplate);
  } else {
    const quotedMailTemplate = $('<template />', {
      class: 'quoted-mail'
    });
    quotedMailTemplate.text(pgp_msg);
    emailWrite.append(quotedMailTemplate);
  }
  emailWrite.on('ready', function() {
    editor = this.editor;
  });
  $('#editorCont').append(emailWrite);
}

$(document).ready(() => {
  load();
  window.addEventListener('mailvelope-disconnect', event => {
    $('#newVersion').val(event.detail.version);
    $('#disconnectModal').modal('show');
  });
});
