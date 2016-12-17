'use strict';

/**
 * Web API Express server.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module server/main
 */

// TODO: Code and test all CRUD methods!
// TODO: Define hooks to prevent updating!
// TODO: Ensure that we have indexes for all queries

const path = require('path');
const feathers = require('feathers');
const compress = require('compression');
const cors = require('cors');
const configuration = require('feathers-configuration');
const bodyParser = require('body-parser');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const databases = require('./databases');
const schemas = require('./schemas');
const services = require('./services');
const middleware = require('./middleware');

const app = feathers();

// TODO: Winston is configured in middleware; deal with this
// TODO: Replace logger with winston
const log = console;

// Configure
app.configure(configuration(path.join(__dirname, '../..')));

// Feathers setup
app.use(compress()).options('*', cors()).use(cors()).use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true })).configure(hooks()).configure(rest()).configure(socketio()).configure(databases).configure(schemas).configure(services).configure(middleware);

// TODO: Handle SIGTERM gracefully for Docker
// SEE: http://joseoncode.com/2014/07/21/graceful-shutdown-in-node-dot-js/
Promise.resolve(app.get('middlewareReady')).then(() => {
  const port = app.get('port');
  const server = app.listen(port);

  server.once('listening', () => log.info('Feathers application started on %s:%s', app.get('host'), port));
}).catch(err => {
  log.error(err);
});