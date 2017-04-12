/**
 * Module dependencies.
 */
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const winston = require('winston');
const mkdirp = require('mkdirp');

/**
 * Load environment variables from .env file
 */
dotenv.load({path: '.env'});

/**
 * Route handlers
 */
const routes = require('./server/routes/index');

/**
 * Winston Logger Configuration
 */
mkdirp.sync(process.env.LOG_DIRECTORY);
winston.add(require('winston-daily-rotate-file'), {
  filename: path.join(process.env.LOG_DIRECTORY, process.env.LOG_FILE),
  localTime: true
});
if (process.env.PROD.toLowerCase() === 'true') {
  winston.remove(winston.transports.Console);
}

/**
 * Express configuration
 */
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 3000;

server.listen(port);
app.use(cors());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//App route configuration
app.use('/api/v1', routes);

//todo for testing purpose
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

/**
 * Socket io configuration
 */
const io = require('socket.io')(server);
io.on('connection', socket => {
  console.log('a user connected');
  socket.on('message_request', message => {
    console.log('got a message - ' + JSON.stringify(message));
    socket.emit('message_response', "hey dude");
  });
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

/**
 * Error Handler.
 */
// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    success: false,
    error: err.message
  });
});

module.exports = app;
