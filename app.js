var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Keen = require('keen.io');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var client = Keen.configure({
    projectId: "53a445cc33e4067ace000002",
    writeKey: "b04056b9f5d57cc33ef3da99a4b0dab6a66bdc1ebde811826deeeece34be59506c61f535d973fba6648ddf46311fb41d4228ad96eb3ee038f99e21bb7839c23957ca2e8fc26866e2861a6db4cf1918f3be6f6b1ecc2a12df30772a049c357d4dd5f60ccfaeb8655e1b17e4e23fdd6e35",
    readKey: "ea2d64ca77323b3dc8e76c24ff67c3b190634a70796efb707172d175753d2aa689609bc9d1c447f633bb81e8c1d09b4a39062a5ad1d0e504fa05bfef06176306e52e2f56c5be4b72fdf7e69484317189e98fde64f54bc3e674814c718f8d86db4e69da8e429e7500bc18d995a42994f0",
    masterKey: "250C8667E54B0087AC5DB88EBE677844"
});

client.addEvents({
    "kegevent": [{"james": "is stupid"}, {"hi" : "bye"}],
    "kegevent2": [{"james": "= stupid"}, {"hi" : "bye"}]
}, function(err, res) {
    if (err) {
        console.log("Oh no, an error!");
    } else {
        console.log("Hooray, it worked!");
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
