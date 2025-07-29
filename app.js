
/**
 * Module dependencies.
 */

var compression = require('compression');
var express = require('express')
  , eventRoutes = require('./routes/eventgo/event')
  , extractedEventRoutes = require('./routes/eventgo/post')
  , activityRoutes = require('./routes/eventgo/activity')
  , http = require('http')
  , path = require('path');
var cors = require('cors');
const fs = require('fs');
var https = require('https');


var cert = fs.readFileSync(__dirname + '/certs/eventgo.widm.csie.ncu.edu.tw-chain.pem');
var key = fs.readFileSync(__dirname + '/certs/eventgo.widm.csie.ncu.edu.tw-key.pem');

// key = key.replace(/\\n/g, '\n')
// cert = cert.replace(/\\n/g, '\n')
var options = {
  key: key,
  cert: cert
};

var app = express();

app.use(compression());
// all environments
app.set('port', process.env.PORT || 3006);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// Enable CORS.
// app.use(cors({
//   origin: '*'
// }));
app.use(cors({
  origin: 'https://eventgo.widm.csie.ncu.edu.tw', // 指定允許的來源
  credentials: true // 允許攜帶 cookies 或認證資訊
}));

//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  // app.use(express.errorHandler());
}

/*
app.use(function(err, req, res, next) {
  // logic
  //console.log(ret.err);
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
*/
app.use(errorHandler);
//app.get('/', routes.index);
//app.get('/users', user.list);
//app.use('/', routes);
//app.get('/users', usersRoutes.getUsers);
app.get('/event', eventRoutes.getSearchEvent);
app.get('/extractedevent', extractedEventRoutes.getSearchExtractedEvent);
app.get('/event/histogram', eventRoutes.getSearchEventHistogram);

app.get('/activity', activityRoutes.getSearchActivity);
app.get('/activity/histogram', activityRoutes.getSearchActivityHistogram);
app.get('/activity/date-histogram', activityRoutes.getActivityDateHistogram);
//app.get('/event', usersRoutes.getHotEvents);
//app.get('/topevents', hotRoutes.getTopEvents());
app.use(function(err, req, res, next) {
  // logic
  //console.log(ret.err);
  if (err) {
    res.status(500).send(err.message);  
  }
  /*
  console.error(err.stack);
  res.status(500).send('Something broke!');
  */
});

app.use(express.static(path.join(__dirname, './public')));

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });
https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;