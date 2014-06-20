var express = require('express');
var router = express.Router();
var mongoose = require('../mongoose');

/* GET home page. */
router.get('/', function(req, res) {
  res.send('ok');
});

router.get('/u', function(req, res) {
	mongoose.Users('philip').find(function (err, users) {
		res.send(users);
	});
});

module.exports = router;
