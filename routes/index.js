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
    title: 'Home'
  });
});

router.get('/u', function(req, res) {
	mongoose.Users.find(function (err, users) {
		res.send(users);
	});
});

router.param('cid', function(req,res, next, cid){
	req.cid = cid;
	next();
});

router.param('username', function(req,res, next, username){
	req.username = username;
	next();
});

router.param('displayName', function(req,res, next, displayName){
	req.displayName = displayName;
	next();
});

router.param('location', function(req,res, next, location){
	req.location = location;
	next();
});

router.param('imageURL', function(req,res, next, imageURL){
	req.imageURL = imageURL;
	next();
});

router.post('/newJSON', function(req, res){
	var user;

  res.send("Post has been hit");
	res.send("POST: ");
	res.send(req.body);

	pours = new mongoose.Pours({
		pour : req.body.pour,
		cid : req.body.cid
	});

	pours.save(function (err) {
    	if (!err) {
        res.send("pours document created");
    		return console.log("pours document created");
   		} else {
        res.send(err);
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
        res.send("user document created");
    		return console.log("user document created");
   		} else {
        res.send(err);
    		return console.log(err);
    	}
  	});

  	console.log(req.body.pour);
  	Keen.client.addEvents({
   		    "session": [req.body]
	    }, function(err, res) {
    	if (err) {
          res.send(err);
    	    console.log(err);
   		} else {
   	    	console.log("Keen event creation done");
   		}
	});
});

router.post('/new/:cid/:username/:displayName/:location/:imageURL', function (req, res){
  var user;
  var session;
  console.log("POST: ");
  console.log(req.body);
  user = new mongoose.Users({
  	cid: req.user.cid,
    username: req.user.username,
    displayName: req.user.displayName,
    location: req.user.location,
    imageURL: req.user.imageURL
  });
  user.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });

  Keen.client.addEvents({
    "Users": [
	    {cid: req.user.cid,
	    	username: req.user.username,
	    	displayName: req.user.displayName,
	    	location: req.user.location,
	    	imageURL: req.user.imageURL}
	]}, function(err, res) {
    if (err) {
        console.log("Oh no, an error!");
    } else {
        console.log("Hooray, it worked!");
    }
  });

  return res.send(user);
});


module.exports = router;
