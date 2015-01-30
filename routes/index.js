var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Mailvelope API Test' });
});

router.get('/manual', function(req, res) {
  res.render('manual', { title: 'Mailvelope Manual API Test' });
});

module.exports = router;
