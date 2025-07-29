/**
 * This module is used for connecting to database, implemented with
 * [Elasticsearch]{@link https://github.com/elastic/elasticsearch-js}.
 *
 * @module model/elasticsearch/Connection
 */
'use strict';
var elasticsearch = require('elasticsearch');

var conn = {
  client: null
};

var connect = function() {
  var client = new elasticsearch.Client({
    // host: '127.0.0.1:9200'
    host: '140.115.54.35:9200'
  });
  conn.client = client;
}
//     log: 'trace'
connect();

module.exports = conn;
