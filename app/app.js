require('newrelic');

var express = require('express');
    routes = require('./routes');
    app = express();

app.use('/', routes);
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Keg server on port ' + server.address().port);
});

module.exports = app;