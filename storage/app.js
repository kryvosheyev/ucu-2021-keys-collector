const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

require('./db/mongo')();

// var routes = require('./routes/index');
const storageRoute = require('./routes/storage');

const bodyDataKeysMiddleware = require('./routes/middlewares/body-data-keys');

const app = express();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyDataKeysMiddleware);

// app.use('/', routes);
app.use('/storage', storageRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({ message: err.message || 'Unknown error' })
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ message: err.message || 'Unknown error' })
});


module.exports = app;
