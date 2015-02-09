var express = require('express');
var router = express.Router();

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

module.exports = router;
