(

function() {
  'use strict';

  module.exports.getUsers = function(req, res, next) {
    //res.send('respond with a resource');
    var ret = {
      err: 'test error'
    }
    //return next(ret.err);
    console.log('getUsers');
    var users = {
      name: [ 'luff', 'jeff']
    }
  
    res.json(users);
  };
})();