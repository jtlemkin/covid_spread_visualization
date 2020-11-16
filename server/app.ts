import createError = require('http-errors');
import express = require('express');
import path = require('path');
import cookieParser = require('cookie-parser');
import logger = require('morgan');
var CronJob = require('cron').CronJob;

var apiRouter = require('./api');
import getPredictions from './getPredictions'

var app = express();
const port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

getPredictions();

app.use('/', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

const job = new CronJob(
  '0 0 0 0 * 1',
  getPredictions,
  null,
  true,
  'America/Los_Angeles'
)

app.listen(port, () => console.log(`Listening on port ${port}`));
