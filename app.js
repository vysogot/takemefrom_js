var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var util = require('util');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var expressSanitizer = require('express-sanitizer');
var bodyParser = require('body-parser');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var games = require('./routes/games');
var places = require('./routes/places');
var actions = require('./routes/actions');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({keys: ['secretkey1', 'secretkey2', '...']}));

app.use(express.static(path.join(__dirname, 'public')));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use user model for authentication
var User = require('./schemas/user');
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  req.body.name = req.sanitize(req.body.name);
  req.body.username = req.sanitize(req.body.username);
  req.body.password = req.sanitize(req.body.password);
  req.body.email = req.sanitize(req.body.email);
  req.body.content = req.sanitize(req.body.content);
  next();
});

app.use('/', routes);
app.use('/games', games);
app.use('/places', places);
app.use('/actions', actions);

// Mongoose connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/takemefrom');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
