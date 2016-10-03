'use strict';

/**
 * Web API Express server.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module server/main
 */

const path = require('path');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const databases = require('./databases');

const app = feathers();

// TODO: Winston is configured in middleware; deal with this
// TODO: Replace logger with winston
const log = console;

// Configure
app.configure(configuration(path.join(__dirname, '../..')));

// Feathers setup
app.use(compress()).options('*', cors()).use(cors()).use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true })).configure(hooks()).configure(rest()).configure(socketio()).configure(databases).configure(services).configure(middleware);

const port = app.get('port');
const server = app.listen(port);

server.on('listening', () => log.info('Feathers application started on %s:%s', app.get('host'), port));