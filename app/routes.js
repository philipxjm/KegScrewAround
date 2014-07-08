var express = require('express');
var router = express.Router();
var mongoose = require('./mongoose');
var Keen = require('./keen');
var bodyParser = require('body-parser');
var async = require('async');
var CO2 = 100.0;
var KegHealth = 100.0;

var error;

/* GET home page. */
router.use(bodyParser());

router.get('/', function(req, res) {
  res.sendfile("./rickroll.jpg");
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

router.get('/CO2', function(req, res) {
  res.send({CO2Level : CO2});
});

router.post('/CO2/add/:addCO2Value', function(req, res) {
  res.send("Added Value to CO2: " + Number(req.addCO2Value) + "%");
});

router.post('/CO2/del/:delCO2Value', function(req, res) {
  res.send("Deleted Value from CO2: " + Number(req.delCO2Value) + "%");
});

router.post('/CO2/reset', function(req, res) {
  CO2 = 100.0;
  res.send("CO2 Level set back to 100%");
});



router.param('addCO2Value', function(req, res, next, addCO2Value) {
  CO2 += Number(addCO2Value);
  req.addCO2Value = addCO2Value;
  next();
});

router.param('delCO2Value', function(req, res, next, delCO2Value) {
  CO2 -= Number(delCO2Value);
  req.delCO2Value = delCO2Value;
  next();
});

//----------
router.get('/keg', function(req, res) {
  res.send({Keg : KegHealth});
});

router.post('/kegHealth/add/:addKegHealth', function(req, res) {
  res.send("Added Value to KegHealth: " + Number(req.addKegHealth) + "%");
});

router.post('/kegHealth/del/:delKegHealth', function(req, res) {
  res.send("Deleted Value from KegHealth: " + Number(req.delKegHealth) + "%");
});

router.post('/KegHealth/reset', function(req, res) {
  KegHealth = 100.0;
  res.send("KegHealth Level set back to 100%");
});

router.param('addKegHealthValue', function(req, res, next, addKegHealth) {
  KegHealth += Number(addKegHealth);
  req.addKegHealth = addKegHealth;
  next();
});

router.param('delKegHealthValue', function(req, res, next, delKegHealth) {
  KegHealth -= Number(delKegHealth);
  req.delKegHealth = delKegHealth;
  next();
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
  res.send(req.pour);
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

router.get('/u/leaderboard', function(req, res) {

  express.leaderboard =[];

  mongoose.Users.find(function(err, users) {
    async.each(users, function(user, callback) {
      express.leaderboard[express.leaderboard.length] = user;
      getOunces((express.leaderboard.length - 1), function(err){
        if(err){
          console.log(err);
          res.send(err);
        }
        callback();
      });
    }, function(err) {
      express.leaderboard.sort(compareUsers);
      console.log(express.leaderboard);
      var leaderboardJSON = [];
      for(var i = 0; i < express.leaderboard.length; i++){
        leaderboardJSON.push({rank : i + 1, user : express.leaderboard[i]});
      }
      console.log(JSON.stringify(leaderboardJSON));
      res.send(JSON.stringify(leaderboardJSON));
    });
    //express.leaderboard.sort(compareUsers);

  });
});

function getOunces(a, callback) {
  try{
    mongoose.Pours.find({
              "cid": express.leaderboard[a].cid
            }).exec(function(err, result) {
              
                var userOunces = 0.0;
                if (!err) {
                  for (i = 0; i < result.length; i += 1) {
                      for(j = 0; j < result[i].pour.length; j += 1){
                          userOunces += result[i].pour[j].fluidOunces;
                      }
                  }
                  console.log(express.leaderboard[a]);
                  express.leaderboard[a].set ('totalOunces' , userOunces);
                  // console.log(express.leaderboard[a])
                  //console.log("---------------------------------------")
                  callback();
                } else {
                  console.log("shit" + err)
                };
    });
  }catch(err) {
    callback(err);
  }
}

function selectionSort(items){

    var len = items.length,
        min;

    for (i=0; i < len; i++){

        // set minimum to this position
        min = i;

        //check the rest of the array to see if anything is smaller
        for (j=i+1; j < len; j++){
            compareLeaders(items[j],items[min],function(){
              if(express.leader == -1){
                console.log("swap");
                min = j;
              }
            });
        }

        //if the minimum isn't in the position, swap it
        if (i != min){
            swap(items, i, min);
        }
    }

    return items;
}

function swap(items, firstIndex, secondIndex){
    var temp = items[firstIndex];
    items[firstIndex] = items[secondIndex];
    items[secondIndex] = temp;
}


function compareUsers(user1, user2) {
  if(user1.totalOunces > user2.totalOunces) {
    return 1;
  }
  else if(user1.totalOunces < user2.totalOunces) {
    return -1;
  }
  else {
    return 0;
  }
}


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
              imageURL: req.body.user.imageURL,
              totalOunces: 0.0
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