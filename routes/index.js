"use strict";
var express = require('express');
var router = express.Router();
var session;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Mailvelope API Test' });
});

router.get('/manual', function(req, res) {
  res.render('manual', { title: 'Mailvelope Manual API Test' });
});

router.get('/settings', function(req, res) {
  res.render('settings', { title: 'Mailvelope Manual API Test' });
});

router.get('/unit', function(req, res) {
  res.render('unit', { title: 'Mailvelope API Unit Test' });
});

// Form test scenarios
const scenarios = {
  'index':                    'Index',
  'success-with-data-action': 'Success with data-action',
  'success-no-data-action':   'Success without data-action',
  'success-json':             'Success with json enctype output',
  'success-html':             'Success with html enctype output',
  'success-file':             'Success file form',
  'success-complex':          'Success complex form',
  'error-empty-form':         'Error Empty form tag',
  'error-two-forms':          'Error Too many form tags',
  'error-empty-signature':    'Error Empty signature',
  'error-missing-id':         'Error Missing id',
  'error-missing-form':       'Error Missing form tag',
  'error-missing-html':       'Error Missing html',
  'error-missing-template':   'Error Missing template',
  'error-missing-recipient':  'Error Missing recipient',
  'error-invalid-action':     'Error invalid action',
  'error-invalid-enctype':    'Error invalid enctype',
  'error-invalid-recipient':  'Error invalid recipient',
  'error-unknown-recipient':  'Error unknown recipient',
  'error-invalid-signature':  'Error invalid signature (checksum)',
  'error-invalid-signature2': 'Error invalid signature (format)',
};
for (let s in scenarios) {
  router.get('/form/' + s, function(req, res) {
    res.render('form/' + s, { title: 'Mailvelope Demo | ' + scenarios[s], scenario: s, scenarios: scenarios });
  });
}

// Form post handling endpoint
// Demonstrate session is working
router.get('/form', function(req, res) {
  res.redirect('/form/index');
});
router.post('/form', function(req, res) {
  session = req.session;
  session.armoredData = req.body.armoredData;
  res.redirect('/form/thanks');
});
router.get('/form/thanks', function(req, res) {
  session = req.session;
  res.render('form/thanks', { title: 'Mailvelope Demo | ' + 'Thank you page', armoredData: session.armoredData});
});

module.exports = router;
