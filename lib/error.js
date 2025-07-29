'use strict';

// Node.js primitive modules.
var util = require('util');

module.exports = SysError;

/**
 * Error
 *
 * @param {Number} code        Numeric error code
 * @param {String} error       Error descripton
 * @param {String} description Full error description
 */
function SysError(error, description, err) {
  if (!(this instanceof SysError))
    return new SysError(error, description, err);

  this.name = this.constructor.name;

  switch (error) {
  case 'invalid_create':
  case 'invalid_params':
  case 'invalid_request':
    this.code = 400;
    break;
  case 'invalid_token':
    this.code = 401;
    break;
  case 'invalid_permission':
    this.code = 403;
    break;
  case 'invalid_client':
  case 'invalid_user':
  case 'not_found':
    this.code = 404;
    break;
  case 'server_error':
    this.code = 503;
    break;
  case 'internal_server_error':
  default:
    this.code = 500;
  }
}