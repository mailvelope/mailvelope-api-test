var express = require('express');
var path = require('path');

var routes = require('./routes/index');
var users = require('./routes/users');
var session = require('express-session');

var app = express();

// session setup
app.use(session({
  secret: 'not really a secret',
  resave: false,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', routes);
app.use('/manual', routes);
app.use('/settings', routes);
app.use('/unit', routes);
app.use('/users', users);
app.use('/form', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

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
