var express = require('express');
var router = express.Router();
var mongoose = require('../mongoose');

/* GET home page. */
router.get('/', function(req, res) {
  res.send('ok');
});

router.get('/u', function(req, res) {
	mongoose.model('UserModel').find(function (err, users) {
		res.send(users);
	});
});

module.exports = router;
