/**
 * This module is used for managing events data in database, implemented with
 * [Elasticsearch]{@link https://github.com/elastic/elasticsearch-js}.
 *
 * @module model/elasticsearch/Event
 */

'use strict';
var conn = require('./connection');

// Index nane
var indexName = 'fbevent';

// Type name.
var typeName = 'event';

// Index.
var createIndex = function() {
  if (!conn.client) {
    return setTimeout(createIndex, 500);
  }

  conn.client.indices.create({
    index: indexName
  }, function (error, response) {
    // ...
    console.log(response);
    putMapping();
  });
  console.log('createIndex();');
};

var util = require('util');

var putMapping = function() {
  let indexMapping = {
    [typeName]: {
      'properties': {
        id: { type: 'keyword' },
        freeTextType: { type: 'keyword' },
        description: {
          type: 'text',
          analyzer: 'ik_smart',
          search_analyzer: 'ik_smart'
        },
        location: {
          type: 'text',
          analyzer: 'ik_smart',
          search_analyzer: 'ik_smart'
        },
		    gps: {
          type: 'geo_point'
        },
        name: {
          type: 'text',
          analyzer: 'ik_smart',
          search_analyzer: 'ik_smart'
        },
        start_time: { type: 'date' },
        end_time: { type: 'date' },
        is_date_only: { type: 'boolean' },
        category : {
          type: 'text',
          analyzer: 'ik_smart',
          search_analyzer: 'ik_smart'
        },
        owner: {
          type: 'nested', 
          properties: {
            id: { type: 'keyword' },
            name: { type: 'keyword' },
            category: {
              type: 'text',
              analyzer: 'ik_smart',
              search_analyzer: 'ik_smart'
            }
          }
        },
        privacy: { type: 'keyword' },
        timezone: { type: 'keyword' },
        updated_time: { type: 'date' },
        venue: {
          type: 'nested', 
          properties: {
            id: { type: 'keyword' },
            city: { type: 'keyword' },
            country: { type: 'keyword' },
            latitude: { type: 'double' },
            longitude: { type: 'double' },
            street: {
              type: 'text',
              analyzer: 'ik_smart',
              search_analyzer: 'ik_smart'
            },
            zip: { type: 'keyword' }
          }
        },
        recordUpdateTime: { type: 'date' },
        imgs: { type: 'keyword' },
        interested_count: { type: 'long' },
        maybe_count: { type: 'long' },
        noreply_count: { type: 'long' },
        attending_count: { type: 'long' },
        fbAPIVer: { type: 'keyword' }
      }
    }
  };

  conn.client.indices.putMapping({
    index: indexName,
    type: typeName,
    body: indexMapping
  }).catch(function (err) {
    console.log('err');
  });

  console.log('conn.client.indices.putMapping');
}
createIndex();

/**
 * To get a list that contains event data.
 *
 * @param {Object} [options] Options.
 *   @param {Object} [options.cond] Conditions.
 *     @param {string} [options.cond.id] The event data id.
 *     @param {string|string[]} [options.cond.city] The event city.
 *     @param {string|string[]} [options.cond.category] The event category.
 *     @param {number[]} [options.cond.gps] Specified gps.
 *     @param {string} [options.cond.multiMatch] The multi match parameter.
 *       @param {string} [options.cond.multiMatch.query] The query string.
 *       @param {string} [options.cond.multiMatch.fields] The fields to be
 *              queried.
 *     @param {string} [options.cond.timeKey='start_time'] Key of query time.
 *     @param {number} [options.cond.from] The begin time to query.
 *     @param {number} [options.cond.to] The end time to query.
 *   @param {Object} [options.fields] To hide or show fields.
 *     @param {boolean} [options.fields.owner=false]
 *   @param {number} [options.skip=0] Number of data to skip.
 *   @param {number} [options.limit=100] Maximum number of object to return.
 *   @param {Object} [options.sort] Sort condition.
 *     @param {string} [options.sort.key='score'] Sort key.
 *     @param {boolean} [options.sort.asc=false] Use descending order.
 * @param {function} callback
 *   @param {falsy|Error} callback.err Elasticsearch error message.
 *   @param {Object|null} callback.result An object that contains the following
 *          fields, or <b>null</b> means that no event data were found.
 *     @param {number} callback.result.count Total number of results matching
 *            our search criteria.
 *     @param {number} callback.result.queryTime Time in seconds for
 *            Elasticsearch to execute the search.
 *     @param {Array} callback.result.events  An array events that contains the
 *            following fields.
 *       @param {string} callback.result.events.id The event id.
 *       @param {string} callback.result.events.name The event name.
 *       @param {string} callback.result.events.description The event
 *              description.
 *       @param {string} callback.result.events.location The event location.
 *       @param {Date} callback.result.events.start_time The event start time.
 *       @param {Date} callback.result.events.end_time The event end time.
 *       @param {string} callback.result.events.category The event category.
 *       @param {Object} [callback.result.events.owner] The event owner
 *              information.
 *         @param {String} [callback.result.events.owner.id] The event owner id.
 *         @param {String} [callback.result.events.owner.name] The event owner
 *                name.
 *         @param {String} [callback.result.events.owner.category] The event
 *                owner category.
 *       @param {Object} callback.result.events.venue The event venue
 *              information.
 *         @param {string} callback.result.events.venue.id The event venue id.
 *         @param {string} callback.result.events.venue.city The event venue
 *                city.
 *         @param {number} callback.result.events.venue.latitude The event venue
 *                latitude.
 *         @param {number} callback.result.events.venue.longitude The event
 *                venue longitude.
 *         @param {string} callback.result.events.venue.street The event venue
 *                street.
 *         @param {string} callback.result.events.venue.zip The event venue zip.
 *       @param {string[]} callback.result.events.imgs The event photos links.
 *       @param {number|null} callback.result.events.interested_count Number of
 *              people interested in the event.
 *       @param {number|null} callback.result.events.maybe_count Number of
 *              people who maybe going to the event.
 *       @param {number|null} callback.result.events.noreply_count Number of
 *              people who did not reply to the event.
 *       @param {number|null} callback.result.events.attending_count Number of
 *              people attending the event.
 */
module.exports.getEvent = function(options, callback) {
// var getEvent = function(options, callback) {
  if (!conn.client) {
    
    return process.nextTick(function() {
      callback('error');
    });
  }
  
  if (typeof(options) === 'function') {
    callback = options;
  }
  
  var cond = {};
  var mustDSL = [];
  var rangeBoolean = false;
  var sourceExcludeFiltering = [];
  //var sort = [];
  var sort = [ { start_time: { order: 'asc' } } ];
  var searchParams = {
    index: indexName,
    type: typeName,
    body: {
      query: {},
      sort: {}
    }
  }

  if (options && (typeof(options) === 'object')) {
    if (options.cond && (typeof(options.cond) === 'object')) {
      var timeKey = 'start_time';
      var c = options.cond;
      if (typeof(c.id) === 'string') {
        mustDSL.push(
          {
            term: {
              id: c.id
            }
          }
        )
        delete c.timeKey;
        delete c.from;
        delete c.to;
      } else if (Array.isArray(c.id)) {
        mustDSL.push(
          {
            terms: {
              id: c.id
            }
          }
        )
        delete c.timeKey;
        delete c.from;
        delete c.to;
      }
      if (typeof(c.multiMatch) === 'object' && 
          typeof(c.multiMatch.query) === 'string' &&
          Array.isArray(c.multiMatch.fields) && c.multiMatch.fields.length) {
        mustDSL.push(
          {
            multi_match: {
              query: c.multiMatch.query,
              fields: c.multiMatch.fields
            }
          }
        )
      }
      if (typeof(c.city) === 'string') {
        mustDSL.push(
          {
            nested: {
              path: "venue",
              query: {
                term: {
                  'venue.city': c.city
                }
              }
            }
          }
        );
      } else if (Array.isArray(c.city)) {
        mustDSL.push(
          {
            nested: {
              path: "venue",
              query: {
                terms: {
                  'venue.city': c.city
                }
              }
            }
          }
        );
      }
      if (typeof(c.category) === 'string') {
        mustDSL.push(
          {
            term: {
              category: c.category
            }
          }
        );
      } else if (Array.isArray(c.category)) {
        mustDSL.push(
          {
            terms: {
              category: c.category
            }
          }
        );
      }
      // if (typeof(c.category) === 'string') {
      //   cond.category = c.category;
      // }

      for (var property in cond) {
        if (cond.hasOwnProperty(property)) {
          mustDSL.push(
            {
              match: {
                [property]: cond[property]
              }
            }
          );
        }
      }

      if (typeof(c.timeKey) === 'string') {
        timeKey = c.timeKey;
      }
      if (typeof(c.from) === 'number') {
        cond[timeKey] = { gte: new Date(c.from) };
        rangeBoolean = true;
      }
      if (typeof(c.to) === 'number') {
        if (cond[timeKey]) {
          cond[timeKey].lte = new Date(c.to);
        } else {
          cond[timeKey] = { lte: new Date(c.to) };
        }
        rangeBoolean = true;
      }
      if (rangeBoolean) {
        mustDSL.push(
          {
            range: {
              [timeKey]: cond[timeKey]
            }
          }
        )
      }
    }
    if (options.fields && (typeof(options.fields) === 'object')) {
      var f = options.fields;
      
      if (f.venue === false) {
        sourceExcludeFiltering.push('venue');
      }
      if (f.description === false) {
        sourceExcludeFiltering.push('description');
      }

      for (var property in f) {
        if (f.hasOwnProperty(property) && f[property] === false) {
          sourceExcludeFiltering.push(property);
        }
      }
    }
    if ((typeof(options.skip) === 'number') && (options.skip > 0)) {
      searchParams.from = options.skip;
    }
    if ((typeof(options.limit) === 'number') && (options.limit >= 0)) {
      if (options.limit > 0) {
        searchParams.size = options.limit;
      }
    }
  //   if (options.sort && (typeof(options.sort) === 'object')) {
  //     var s = options.sort;
  //     if (('key' in s) && (typeof(s.key) === 'string')) {
  //       if (s.asc === true) {
  //         sort.push({ [s.key]: { order: 'asc' } });
  //       }
  //       if (s.asc === false) {
  //         sort.push({ [s.key]: { order: 'desc' } });
  //         // console.log('sort[s.key]: ' + util.inspect(sort[s.key], 
  //         //   {showHidden: false, depth: null}));
  //       }
  //     } else if (s.asc === true) {
  //       sort = [
  //         { start_time: { order: 'asc' } }
  //       ];
  //     } else if (s.asc === false) {
  //       sort = [
  //         { start_time: { order: 'desc' } }
  //       ];
  //     }
  //   }
  // }
  if (options.sort && (typeof(options.sort) === 'object')) {
      var s = options.sort;
      if (('key' in s) && (typeof(s.key) === 'string')) {
        if (s.asc === true) {
          sort = [ { [s.key]: { order: 'asc' } } ];
        }
        if (s.asc === false) {
          sort = [ { [s.key]: { order: 'desc' } } ];
        }
      } else if (s.asc === true) {
        sort = [ { start_time: { order: 'asc' } } ];
      } else if (s.asc === false) {
        sort = [ { start_time: { order: 'desc' } } ];
      }
    }
  }
  if (Array.isArray(sourceExcludeFiltering) && sourceExcludeFiltering.length) {
    searchParams._sourceExclude = sourceExcludeFiltering;
  }
  if (Array.isArray(mustDSL) && mustDSL.length){
    // searchParams.body = {
    //   query: {
    //     bool:{
    //       must: mustDSL
    //     }
    //   }
    // }
    searchParams.body.query = {
      bool:{
        must: mustDSL
      }
    }
  }
  if (Array.isArray(sort) && sort.length){
    searchParams.body.sort = sort;
  }

  console.log('searchParams: ' + JSON.stringify(searchParams));
  // console.log('searchParams: ' + util.inspect(searchParams, 
  //   {showHidden: false, depth: null}));
  conn.client.search(searchParams, function (err, response) {
    //console.log(response);
    if (err) {
      return callback(err); 
    }

    let count;
    let queryTime;
    let events = [];
    let hits = [];
    if ('took' in response && 'hits' in response && 'hits' in response.hits) {
      count = response.hits.total;
      queryTime = response.took / 1000;
      hits = response.hits.hits;
    } else {
      var err = {
        message: 'server error'
      }
      return callback(err); 
    }
    for (var i = 0; i < hits.length; i++){
      events.push(hits[i]['_source']);
    }
    var result = {
      count: count,
      queryTime: queryTime,
      events: events
    };
    return callback(err, result);
  });
};

/**
 * To get event data histogram.
 *
 * @param {Object} params Parameter.
 *   @param {string} params.groupField Specified group field.
 * @param {Object} [options] Options.
 *   @param {Object} [options.cond] Conditions.
 *     @param {string} [options.cond.id] The event data id.
 *     @param {string|string[]} [options.cond.city] The event city.
 *     @param {string|string[]} [options.cond.category] The event category.
 *     @param {number[]} [options.cond.gps] Specified gps.
 *     @param {string} [options.cond.multiMatch] The multi match parameter.
 *       @param {string} [options.cond.multiMatch.query] The query string.
 *       @param {string} [options.cond.multiMatch.fields] The fields to be
 *              queried.
 *     @param {string} [options.cond.timeKey='start_time'] Key of query time.
 *     @param {number} [options.cond.from] The begin time to query.
 *     @param {number} [options.cond.to] The end time to query.
 *   @param {number} [options.limit=20] Maximum number of aggregations object
 *          to return.
 *   @param {Object} [options.sort] Sort condition.
 *     @param {string} [options.sort.key='value'] Sort key. Available
 *            expressions value or key.
 *     @param {boolean} [options.sort.asc=false] Use ascending order.
 * @param {function} callback
 *   @param {falsy|Error} callback.err Elasticsearch error message.
 *   @param {Array|null} callback.dataStats An array that contains the following
 *          fields, or <b>null</b> means that no downlink data statistical
 *          information were found.
 *     @param {string} callback.dataStats.key The key shows string.
 *     @param {number} callback.dataStats.value Quantity that matches the key.
 */
//module.exports.getEventHistogram = function(params, options, callback) {
function getEventHistogram(params, options, callback) {
  if (typeof(options) === 'function') {
    callback = options;
    options = undefined;
  }

  if (!conn.client) {
    return process.nextTick(function() {
      callback('Invalid database');
    });
  }

  let searchParams = {
    index: indexName,
    type: typeName,
    body: {}
  };
  let cond = {};
  let mustDSL = [];
  let rangeBoolean = false;
  let aggs = {
    key: {
      terms: {
        field: '',
        order : { _count : 'desc' },
        size: 20
      }
    }
  };

  if (params && (typeof(params) === 'object')) {
    if (typeof(params.groupField) === 'string') {
      aggs.key.terms.field = params.groupField;

      if (params.groupField === 'category') {
        delete aggs.key.terms.field;
        aggs.key.terms.script = {
          //source: 'def category = doc["category.keyword"].value;\\n\\nif (category !== null) {\\n  String[] parts = \/、\/.split(category);\\n  return parts;\\n}\\nreturn category;\\n',
          source: "def category = doc['category.keyword'].value;\n\nif (category !== null) {\n  String[] parts = /、/.split(category);\n  return parts;\n}\nreturn category;\n",
          lang: 'painless'
        }
      }
    }
  }

  if (options && (typeof(options) === 'object')) {
    if (options.cond && (typeof(options.cond) === 'object')) {
      var timeKey = 'start_time';
      var c = options.cond;
      if (typeof(c.id) === 'string') {
        mustDSL.push(
          {
            term: {
              id: c.id
            }
          }
        )
        delete c.timeKey;
        delete c.from;
        delete c.to;
      } else if (Array.isArray(c.id)) {
        mustDSL.push(
          {
            terms: {
              id: c.id
            }
          }
        )
        delete c.timeKey;
        delete c.from;
        delete c.to;
      }
      if (typeof(c.multiMatch) === 'object' && 
          typeof(c.multiMatch.query) === 'string' &&
          Array.isArray(c.multiMatch.fields) && c.multiMatch.fields.length) {
        mustDSL.push(
          {
            multi_match: {
              query: c.multiMatch.query,
              fields: c.multiMatch.fields
            }
          }
        )
      }
      if (typeof(c.city) === 'string') {
        mustDSL.push(
          {
            nested: {
              path: "venue",
              query: {
                term: {
                  'venue.city': c.city
                }
              }
            }
          }
        );
      } else if (Array.isArray(c.city)) {
        mustDSL.push(
          {
            nested: {
              path: "venue",
              query: {
                terms: {
                  'venue.city': c.city
                }
              }
            }
          }
        );
      }
      if (typeof(c.category) === 'string') {
        mustDSL.push(
          {
            term: {
              category: c.category
            }
          }
        );
      } else if (Array.isArray(c.category)) {
        mustDSL.push(
          {
            terms: {
              category: c.category
            }
          }
        );
      }
      // if (typeof(c.category) === 'string') {
      //   cond.category = c.category;
      // }

      for (var property in cond) {
        if (cond.hasOwnProperty(property)) {
          mustDSL.push(
            {
              match: {
                [property]: cond[property]
              }
            }
          );
        }
      }

      if (typeof(c.timeKey) === 'string') {
        timeKey = c.timeKey;
      }
      if (typeof(c.from) === 'number') {
        cond[timeKey] = { gte: new Date(c.from) };
        rangeBoolean = true;
      }
      if (typeof(c.to) === 'number') {
        if (cond[timeKey]) {
          cond[timeKey].lte = new Date(c.to);
        } else {
          cond[timeKey] = { lte: new Date(c.to) };
        }
        rangeBoolean = true;
      }
      if (rangeBoolean) {
        mustDSL.push(
          {
            range: {
              [timeKey]: cond[timeKey]
            }
          }
        )
      }
    }

    if ((typeof(options.limit) === 'number') && (options.limit > 0)) {
      aggs.key.terms.size = options.limit;
    }
    if (options.sort && (typeof(options.sort) === 'object')) {
      let s = options.sort;
      let sortKey = 'value';
      let sortOrder = 'desc';
      if (('key' in s) && (typeof(s.key) === 'string')) {
        sortKey = s.key;
      }
      if (sortKey === 'value') {
        sortKey = '_count';
      } else if (sortKey === 'key') {
        sortKey = '_key';
      }
      if (('asc' in s) && (typeof(s.asc) === 'boolean')) {
        sortOrder = (s.asc === true) ? 'asc' : 'desc';
      }
      aggs.key.terms.order = { [sortKey]: sortOrder };
    }
  }
  searchParams.body.aggs = aggs;
  searchParams.body.size = 0;
  if (mustDSL.length) {
    searchParams.body.query = {
      bool: {
        must: mustDSL
      }
    };
  }
  conn.client.search(searchParams, function(err, response) {
    if (err) {
      return callback(err);
    }
    let dataStats = [];
    if (response.aggregations.key.buckets &&
        response.aggregations.key.buckets.length >= 1) {
      let datas = response.aggregations.key.buckets;
      for (let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let dataStatsItem = {
          key: data.key,
          value: data.doc_count
        };
        dataStats.push(dataStatsItem);
      }
    } else {
      dataStats = null;
    }
    callback(err, dataStats);
  });
};

var now = new Date();
var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

var options = {
  cond: {
    multiMatch: {
      query: '中壢火車站',
      fields: [ 'name^1.6', 'description^0.8', 'location^1.6' ]
    },
    timeKey: 'start_time',
    from: now.getTime(),
    to: to
  },
  fields: {
    owner: false,
    description: false
  }
};

// var options = {
//   cond: {
//     id: 'FBEvent_210305579520571'
//   },
//   fields: {
//     owner: false
//   }
// }
/*
setTimeout(getEvent, 1000, options, function(err, events) {
  for(var i = 0; i < events.length; i++) {
    console.log('event: ' + util.inspect(events[i], {showHidden: false, depth: null }));
  }
})
*/

var params =  { groupField: 'category' }
//params.groupField 
setTimeout(getEventHistogram, 1000, params, options, function(err, datas) {
  for(var i = 0; i < datas.length; i++) {
    console.log('data: ' + util.inspect(datas[i], {showHidden: false, depth: null }));
  }
})

function getCurrentDayTime() {
  const d = new Date();

  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      0,
      0
    )
  )
}
console.log(getCurrentDayTime().toISOString());