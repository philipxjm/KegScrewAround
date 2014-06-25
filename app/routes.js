var express = require('express');
var router = express.Router();
var mongoose = require('./mongoose');
var Keen = require('./keen');
var bodyParser = require('body-parser');
var error;

/* GET home page. */
router.use(bodyParser(), function() {
  console.log("hi");
});

router.get('/', function(req, res) {
  res.send("Keg Screw Around");
});

router.get('/u', function(req, res) {
  mongoose.Users.find(function(err, users) {
    console.log("Getting all Users");
    res.send(users);
  });
});

router.get('/p', function(req, res) {
  mongoose.Pours.find(function(err, pours) {
    console.log("Getting all Pours");
    res.send(pours);
  });
});

router.param('cid', function(req, res, next, cid) {
  mongoose.Users.find({
    "cid": cid
  }).exec(function(err, result) {
    if (!err) {
      console.log("got cid query result for user: " + cid);
      req.user = result;
    } else {
      console.log("error at query cid" + err)
    };
    //next();
  });
  mongoose.Pours.find({
    "cid": cid
  }).exec(function(err, result) {
    if (!err) {
      console.log("got cid query result for pour: " + cid);
      req.pour = result;
    } else {
      console.log("error at query cid" + err)
    };
    next();
  });
});

router.param('username', function(req, res, next, username) {
  mongoose.Users.find({
    "username": username
  }).exec(function(err, result) {
    if (!err) {
      console.log("got username query result: " + username);
      req.user = result;
    } else {
      console.log("error at query username" + err)
    };
    next();
  });
});

router.param('id', function(req, res, next, id) {
  req.id = id;
  next();
});

router.get('/u/cid/:cid', function(req, res) {
  res.send(req.user);
});

router.get('/u/username/:username', function(req, res) {
  res.send(req.user);
});

router.get('/p/cid/:cid', function(req, res) {

});

router.get('/p/cid/:cid/id/:id', function(req, res) {
  var gotPours = req.pour[0];
  console.log(gotPours);
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  for (var i = 0; i < gotPours.pour.length; i++) {
    if (gotPours.pour[i].id == req.id) {
      res.write(JSON.stringify(gotPours.pour[i]));
    }
  }
  res.end();
  console.log(req.id);

});

//passing JSON post
router.post('/newJSON', function(req, res) {
  var user, pours;
  console.log("Got response: " + res.statusCode);
  console.log('request =' + JSON.stringify(req.body));

  //TEST IF USER IS REDUNDANT
  mongoose.Users.find({
    "cid": req.body.cid
  }).exec(function(err, result) {
    if (!err) {
      try {
        var inUser = result;
        if (inUser[0].cid == req.body.cid) {
          console.log("redundancy found");
          console.log("aborting user post request, still posting pour");
          return res.send("user cid is redundant, aborting user post");
        }
      } catch (err) {
        console.log(err);
        if (err.message == "Cannot read property 'cid' of undefined") {
          res.send("No user cid redundancy found, continueing with post request")
          console.log("no redundancy found");
          try {
            user = new mongoose.Users({
              cid: req.body.cid,
              username: req.body.user.username,
              displayName: req.body.user.displayName,
              location: req.body.user.location,
              imageURL: req.body.user.imageURL
            });

            user.save(function(err) {
              if (!err) {
                return console.log("user document created");
              } else {
                console.log("error at Users creation")
                return console.log(err);
              }
            });
            res.end();
          } catch (err) {
            console.log(err);
          }
        }
      }
    } else {
      console.log("error at query cid" + err)
    };
  });


  if (req.body.hasOwnProperty('cid') &&
    req.body.hasOwnProperty('user') &&
    req.body.hasOwnProperty('pour')) {
    if(req.body.pour[0].hasOwnProperty('id') &&
      req.body.pour[0].hasOwnProperty('container') &&
      req.body.pour[0].hasOwnProperty('currentTime') &&
      req.body.pour[0].hasOwnProperty('startTime') &&
      req.body.pour[0].hasOwnProperty('endTime') &&
      req.body.pour[0].hasOwnProperty('fluidOunces') && 
      req.body.pour[0].hasOwnProperty('temperature') &&
      req.body.pour[0].hasOwnProperty('humidity')){

      pours = new mongoose.Pours({
        pour: req.body.pour,
        cid: req.body.cid
      });
      pours.save(function(err) {
        if (!err) {
          Keen.client.addEvents({
              "Sessions": [req.body]
            },
            function(err, result) {
              if (err) {
                console.log("error at Keen event creation")
                console.log(err);
              } else {
                console.log("Keen event created");
              }
            }
          );
          return console.log("pours document created");
        } else {
          console.log("error at Pours creation, keen aborted")
          return console.log(err);
        }
      });
    } else {
      console.log("pour input is not in the right format");
    }
  } else {
    console.log("JSON input is not in the right format");
  }
});

router.post('/newUser', function(req, res) {
  mongoose.Users.find({
    "cid": req.body.cid
  }).exec(function(err, result) {
    if (!err) {
      try {
        var inUser = result;
        if (inUser[0].cid == req.body.cid) {
          console.log("redundancy found --> aborting user post request");
          return res.send("user cid is redundant");
        }
      } catch (err) {
        if (err.message == "Cannot read property 'cid' of undefined") {
          res.send("No user cid redundancy found, continueing with post request")
          console.log("no redundancy found");
          try {
            user = new mongoose.Users({
              cid: req.body.cid,
              username: req.body.user.username,
              displayName: req.body.user.displayName,
              location: req.body.user.location,
              imageURL: req.body.user.imageURL
            });

            user.save(function(err) {
              if (!err) {
                return console.log("user document created");
              } else {
                console.log("error at Users creation")
                return console.log(err);
              }
            });
            res.end();
          } catch (err) {
            console.log(err);
          }
        }
      }
    } else {
      console.log("error at query cid" + err)
    };
  });
});

module.exports = router;