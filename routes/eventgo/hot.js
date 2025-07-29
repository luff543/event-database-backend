(

function() {
  'use strict';

  var model = require('../../models/eventgo-elasticsearch/hot');

  module.exports.getTopEvents = function(req, res) {
    //res.send('respond with a resource');
    var result;
    model.getTopEvents( function(err, hits) {
      //console.log(hits);
      result = hits;
    })
    console.log(result);
    res.send('respond with a resource');
  };
})();
