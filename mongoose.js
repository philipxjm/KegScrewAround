var mongoose = require('mongoose');

var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://philipxjm:Iamgood2@ds043348.mongolab.com:43348/heroku_app26584479';

var theport = process.env.PORT || 5000;

mongoose.connect(uristring, function (err, res) {
  	if (err) {
 		console.log ('ERROR connecting to: ' + uristring + '. ' + err);
 	} else {
 		console.log ('Succeeded connected to: ' + uristring);
  	}
});

var SessionSchema = new mongoose.Schema({
	pour: [{
        id: Number,
        container: String,
        currentTime: Number,
        startTime: Number,
        endTime: Number,
        fluidOunces: Number,
        temperature: Number,
        humidity: Number
    }],
    cid : Number,
    sessionID : Number
});

var SessionModel = mongoose.model('SessionModel', SessionSchema);
var UserSchema = new mongoose.Schema({
        cid: Number,
        username: String,
        displayName: String,
        location: String,
        imageURL: String
});

var Users = mongoose.model('Users', UserSchema);

module.exports = {
    'SessionModel' : SessionModel,
    'Users' : Users,
	'mongoose' : mongoose
}