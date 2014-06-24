var express = require('express');
var router = express.Router();
var mongoose = require('./mongoose');
var Keen = require('./keen');
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

router.param('cid', function(req, res, next, cid){
  mongoose.Users.find({"cid" : cid}).exec(function(err, result) {
    if (!err) {
      console.log("got cid query result: " + cid);
      req.result = result;
    } else {
      console.log("error at query cid" + err)
    };
    next();
  });
});

router.param('username', function(req, res, next, username){
  mongoose.Users.find({"username" : username}).exec(function(err, result) {
    if (!err) {
      console.log("got username query result: " + username);
      req.result = result;
    } else {
      console.log("error at query username" + err)
    };
    next();
  });
});

router.get('/u/cid/:cid',function(req,res){
  res.send(req.result);
});

router.get('/u/username/:username',function(req,res){
  res.send(req.result);
});


//passing JSON post
router.post('/newJSON', function(req, res){
  res.send("Post has been hit " + JSON.stringify(req.body));
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
   	  "Sessions": [req.body]
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
