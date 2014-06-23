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
	console.log("hi");
	var user;
	console.log("POST: ");
	res.send(req.body);
	user = new mongoose.Users({
  		cid: req.body.cid,
    	username: req.body.username,
    	displayName: req.body.displayName,
    	location: req.body.location,
    	imageURL: req.body.imageURL
  	});

  	user.save(function (err) {
    	if (!err) {
    		return console.log("created");
   		} else {
    		return console.log(err);
    	}
  	});

  	Keen.client.addEvents({
   		"session": [{
  		cid: req.body.cid,
    	username: req.body.username,
    	displayName: req.body.displayName,
    	location: req.body.location,
    	imageURL: req.body.imageURL
  	}]
	}, function(err, res) {
    	if (err) {
    	    console.log(err);
   		} else {
   	    	console.log("Hooray, it worked!");
   		}
	});
});

router.post('/new/:cid/:username/:displayName/:location/:imageURL', function (req, res){
  var user;
  var session;
  console.log("POST: ");
  console.log(req.body);
  user = new mongoose.Users({
  	cid: req.cid,
    username: req.username,
    displayName: req.displayName,
    location: req.location,
    imageURL: req.imageURL
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
	    {cid: req.cid,
	    	username: req.username,
	    	displayName: req.displayName,
	    	location: req.location,
	    	imageURL: req.imageURL}
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
