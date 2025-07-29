(/**
 * 
 *
 * @module routes/Index
 */
function() {
'use strict';

var usersRoutes     = require('./users');

/**
 * To register APIs to the Express instance.
 *
 * @param {Object} app The Express instance.
 */
  module.exports = function(app) {
    app.get('/users', usersRoutes.getUsers);

  };

})();
