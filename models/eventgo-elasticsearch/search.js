(

function() {

'use strict';

var conn = require('./connection');


module.exports.getSearchEvents = function(num, callback) {
    if (!conn.client) {
      
      return process.nextTick(function() {
        callback('error');
      });
    }
    
    if (typeof(query) === 'function') {
      callback = query;
    } else if (typeof(num) === 'number') {
      
    }
    
    conn.client.search({
      index: 'fb',
      type: 'post',
      body: {
        query: {
          match_all: {
            body: {}
          }
        }
      }
    }).then(function (resp) {
        var hits = resp.hits.hits;
        //console.log(hits);
        callback(null, hits);
    }, function (err) {
        console.trace(err.message);
    });

  };

})();