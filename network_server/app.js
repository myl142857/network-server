var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require ('express-session');
//var engines = require('consolidate');
var FlakeIdGen = require('flake-idgen')
, intformat = require('biguint-format')
, generator = new FlakeIdGen;

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/card');

var routes = require(__dirname + '/routes/index');
//var users = require(__dirname + '/routes/users');
var dirname = __dirname;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.engine('html', engines.mustache);
//app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('dominion clone'));
//console.log(cookieParser);
app.use(session({
  genid: function(req) {
    return ""+intformat(generator.next(), 'dec'); // use UUIDs for session IDs
  },
  maxAge: 1*60*1000,
  secret: 'dominion clone',
  cookie: { username: "" }
}));

app.set('session',session);
app.use(express.static(path.join(__dirname, 'public')));

//Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    //This needs to be here for the views rendered in angular
    req.abs_path = dirname;
    
    next();
    
});

app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forwarding to error handler
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
