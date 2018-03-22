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

// Form test routes
router.get('/form', function(req, res) {
  res.render('form/default', { title: 'Mailvelope Encrypted Form test' });
});
router.post('/form', function(req, res) {
  session = req.session;
  session.armoredData = req.body.armoredData;
  res.redirect('/form/thanks');
});
router.get('/form/thanks', function(req, res) {
  session = req.session;
  res.render('form/result', { title: 'Mailvelope Encrypted Form test', armoredData: session.armoredData});
});
router.get('/form/simple-no-data-url', function(req, res) {
  res.render('form/simple-no-data-url', { title: 'Mailvelope Encrypted Form test | Simple form with no data-url' });
});
router.get('/form/simple-with-data-url', function(req, res) {
  res.render('form/simple-with-data-url', { title: 'Mailvelope Encrypted Form test | Simple form with data-url' });
});
router.get('/form/simple', function(req, res) {
  res.render('form/simple', { title: 'Mailvelope Encrypted Form test' });
});
router.get('/form/missing-recipient', function(req, res) {
  res.render('form/missing-recipient', { title: 'Mailvelope Encrypted Form test | Missing recipient property' });
});
router.get('/form/missing-form', function(req, res) {
  res.render('form/missing-form', { title: 'Mailvelope Encrypted Form test | Missing Form Tag' });
});
router.get('/form/missing-url', function(req, res) {
  res.render('form/missing-url', { title: 'Mailvelope Encrypted Form test | Missing url property' });
});
router.get('/form/empty-form', function(req, res) {
  res.render('form/empty-form', { title: 'Mailvelope Encrypted Form test | Empty Form Tag' });
});
router.get('/form/empty-signature', function(req, res) {
  res.render('form/empty-signature', { title: 'Mailvelope Encrypted Form test | Empty Form Tag' });
});
router.get('/form/empty-signature', function(req, res) {
  res.render('form/empty-signature', { title: 'Mailvelope Encrypted Form test | Empty Form Tag' });
});
module.exports = router;
