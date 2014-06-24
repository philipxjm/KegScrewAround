var express = require('express');
var router = express.Router();
var mongoose = require('../mongoose');
var Keen = require('../keen');
var bodyParser = require('body-parser');

/* GET home page. */
router.use(bodyParser(), function(){
  console.log("hi");
});

router.get('/', function(req, res) {
  res.render('index', {
    title: 'KegScrewAround'
  });
});

router.get('/u', function(req, res) {
	mongoose.Users.find(function (err, users) {
		res.send(users);
	});
});

router.get('/p', function(req, res) {
  mongoose.Pours.find(function (err, pours) {
    res.send(pours);
  });
});



router.post('/newJSON', function(req, res){
  res.send("Post has been hit " + req.body);
	var user, pours;
  console.log("Got response: " + res.statusCode);
	console.log('request =' + JSON.stringify(req.body));

	pours = new mongoose.Pours({
		pour : req.body.pour,
		cid : req.body.cid
	});

	pours.save(function (err) {
    if (!err) {
    	return console.log("pours document created");
   	} else {
      console.log("error at Pours creation")
  		return console.log(err);
  	}
  });

	user = new mongoose.Users({
  		cid: req.body.cid,
    	username: req.body.user.username,
    	displayName: req.body.user.displayName,
    	location: req.body.user.location,
    	imageURL: req.body.user.imageURL
  });

  user.save(function (err) {
    	if (!err) {
        return console.log("user document created");
   		} else {
        console.log("error at Users creation")
        return console.log(err);
    	}
  });
  Keen.client.addEvents({
   	  "session": [req.body]
	  }, function(err, res) {
      if (err) {          
          console.log("error at Keen event creation")
    	    console.log(err);
   		} else {
   	    	console.log("Keen event created");
   		}
    }
	);
});

module.exports = router;
