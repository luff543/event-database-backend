/**
 * This module is used for managing query log data in database, implemented with
 * [Elasticsearch]{@link https://github.com/elastic/elasticsearch-js}.
 *
 * @module model/elasticsearch/Event
 */

'use strict';
var conn = require('./connection');

// Index nane
var indexName = 'querylog';

// Type name.
var userQueryTypeName = 'userquerys';
var queryResultTypeName = 'queryResult';

// Index 
var createIndex = function() {
    if (!conn.client) {
        return setTimeout(createIndex, 500);
    }

    conn.client.indices.create({
        index: indexName   
    }, function(error, response){
        console.log(response);
        putMapping();
    });
    console.log('createIndex();');
};

var util = require('util');

var putMapping = function() {
    let indexMapping = {
        [userQueryTypeName] : {
            'properties': {
                query: {
                    type: 'text',
                    analyzer: 'ik_smart'
                },
                category: {
                    type: 'text',
                    analyzer: 'ik_smart',
                    search_analyzer: 'ik_smart'
                },
                city: { type: 'keyword' },
                from: { type: 'date' },
                to: { type: 'date' },
                gps: { type: 'geo_point' },
                sort: { type: 'keyword' },
                asc: { type: 'keyword' }
            }
        }
    }

    conn.client.indices.putMapping({
        index: indexName,
        type: userQueryTypeName,
        body: indexMapping
    }).catch(function (err) {
        console.log('err');
    });

    indexMapping = {
        [queryResultTypeName]: {
            'properties': {
                id: { type: 'keyword' },
                interested_count: { type: 'long' },
                from: { type: 'date' },
                to: { type: 'date'}
            }
        }
    }

    conn.client.indices.putMapping({
        index: indexName,
        type: queryResultTypeName,
        body: indexMapping
    }).catch(function (err) {
        console.log('err');
    });

    console.log('conn.client.indices.putMapping');
}
// createIndex();

module.exports.addUserQuery = function(query, callback) {
    if (!conn.client) {
        return process.nextTick(function() {
          callback('error');
        });
    }

    let bodyMapping = {
        /*id: null,
        city: null,
        category: null,
        gps: null,
        query: null*/
    }

    if (query.id) {
        bodyMapping.id = query.id;
    }
    if (query.city) {
        bodyMapping.city = query.city;
    }
    if (query.category) {
        bodyMapping.category = query.category;
    }
    if (query.gps) {
        bodyMapping.gps = query.gps;
    }
    if (query.query) {
        bodyMapping.query = query.query;
    }

    conn.client.index({
        index: indexName,
        type: userQueryTypeName,
        body: bodyMapping
    }, function (error, response) {
        //callback('error');
    });
}

module.exports.addQueryResult = function(results) {
    if(!conn.client) {
        return process.nextTick(function() {
            callback('error');
        });
    }
    //var c = results.cond;

    for(var i=0; i<results.length; i++){
        let bodyMapping = {
            /*id: null,
            interested_count: null,
            from: null,
            to: null*/
        }
        if(results[i]['id']) {
            bodyMapping.id = results[i]['id'];
        }
        if(results[i]['interested_count']){
            bodyMapping.interested_count = results[i]['interested_count'];
        }
        if(results[i]['start_time']){
            bodyMapping.from = results[i]['start_time'];
        }
        if(results[i]['end_time']){
            bodyMapping.to = results[i]['end_time'];
        }
        conn.client.index({
            index: indexName,
            type: queryResultTypeName,
            body: bodyMapping
        }, function(error, response) {

        });
    }
}