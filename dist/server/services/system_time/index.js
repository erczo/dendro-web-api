'use strict';

const hooks = require('./hooks');
const { errors } = require('feathers-errors');

class Service {
  get(id) {
    // HACK: Only supports UTC for now - hardcoded
    // TODO: Incorporate Moment.js and timezones to better deal with time
    // TODO: Service should return more info/stats about the time and timezone
    // TODO: The _id should resemble a proper timezone identifier, e.g. 'America-Los_Angeles'
    const now = new Date();
    switch (id.toLowerCase()) {
      case 'utc':
        return Promise.resolve({
          _id: 'utc',
          now: now
        });
      default:
        throw new errors.NotFound('Page not found');
    }
  }
}

module.exports = function () {
  return function () {
    const app = this;

    app.use('/system/time', new Service());

    // Get the wrapped service object, bind hooks
    const timeService = app.service('/system/time');

    timeService.before(hooks.before);
    timeService.after(hooks.after);
  };
}();