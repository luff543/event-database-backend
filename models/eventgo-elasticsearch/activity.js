/**
 * This module is used for managing events data in database, implemented with
 * [Elasticsearch]{@link https://github.com/elastic/elasticsearch-js}.
 *
 * @module model/elasticsearch/Activity
 */

'use strict';
var conn = require('./connection');
var calcGPSDistance = require('gps-distance');

// Index nane
var indexName = 'activity';

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
        freetext_type: { type: 'keyword' },
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
        created_time: { type: 'date' },
        is_date_only: { type: 'boolean' },
        category : {
          type: 'text',
          analyzer: 'ik_smart',
          search_analyzer: 'ik_smart',
          fields: {
            keyword: {
              type: 'keyword'
            }
          }
        },
        category_list: {
          type: 'keyword'
        },
        age_group: {
          type: 'text',
          analyzer: 'ik_smart',
          search_analyzer: 'ik_smart',
          fields: {
            keyword: {
              type: 'keyword'
            }
          }
        },
        age_group_list: {
          type: 'keyword'
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
            area: { type: 'keyword' },
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
        imgs: { type: 'keyword' },
        hot_count: { type: 'long' },
        interested_count: { type: 'long' },
        maybe_count: { type: 'long' },
        noreply_count: { type: 'long' },
        attending_count: { type: 'long' },
        num_mood: { type: 'long' },
        num_likes: { type: 'long' },
        num_angry: { type: 'long' },
        num_ha: { type: 'long' },
        num_wow: { type: 'long' },
        num_love: { type: 'long' },
        num_sad: { type: 'long' },
        num_comments: { type: 'long' },
        num_shares: { type: 'long' },
        fb_API_version: { type: 'keyword' },
        highlight_description: { type: 'keyword' }
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
// createIndex();

/**
 * To get a list that contains activity data.
 *
 * @param {Object} [options] Options.
 *   @param {Object} [options.cond] Conditions.
 *     @param {string} [options.cond.id] The event data id.
 *     @param {string|string[]} [options.cond.city] The event city.
 *     @param {string|string[]} [options.cond.category] The event category.
 *     @param {string|string[]} [options.cond.type] The event freetext type.
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
module.exports.getActivity = function(options, callback) {
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
  let lat;
  let lon;
  let radius;
  let geoDistanceReportMode = false;
  let geoDistanceFilterMode = false;
  let geoDistanceSortMode = false;

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
        c.city = (c.city === '未分區' ? '' : c.city);
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
        let fIndex = c.city.indexOf('未分區');
        if (fIndex >=0) {
          c.city[fIndex] = '';
        }
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
        // 檢查字串是否包含 * 符號
        if (c.category.includes('*')) {
          mustDSL.push(
            {
              wildcard: {
                category_list: c.category
              }
            }
          );
        } else {
          mustDSL.push(
            {
              term: {
                category_list: c.category
              }
            }
          );
        }
      } else if (Array.isArray(c.category)) {
        let fIndex = c.category.indexOf('未分類');
        if (fIndex >=0) {
          c.category[fIndex] = '';
        }
        
        // 檢查陣列中是否有任何項目包含 * 符號
        let hasWildcard = c.category.some(function(cat) {
          return typeof cat === 'string' && cat.includes('*');
        });
        
        if (hasWildcard) {
          // 使用 bool.should + wildcard 查詢
          let shouldClauses = c.category.map(function(cat) {
            if (typeof cat === 'string' && cat.includes('*')) {
              return {
                wildcard: {
                  category_list: cat
                }
              };
            } else {
              return {
                term: {
                  category_list: cat
                }
              };
            }
          });
          
          mustDSL.push(
            {
              bool: {
                should: shouldClauses,
                minimum_should_match: 1
              }
            }
          );
        } else {
          // 原本的 terms 查詢
          mustDSL.push(
            {
              terms: {
                category_list: c.category
              }
            }
          );
        }
      }
      if (typeof(c.type) === 'string') {
        mustDSL.push(
          {
            term: {
              freetext_type: c.type
            }
          }
        );
      } else if (Array.isArray(c.type)) {
        mustDSL.push(
          {
            terms: {
              freetext_type: c.type
            }
          }
        );
      }
      if (typeof(c.gps) === 'string') {
        geoDistanceReportMode = true;
        let splitLatLon = c.gps.split(",");
        lat = parseFloat(splitLatLon[0]);
        lon = parseFloat(splitLatLon[1]);
        if (typeof(c.radius) === 'number') {
          radius = c.radius.toString();
          geoDistanceFilterMode = true;
          mustDSL.push(
            {
              "geo_distance": {
                "distance": radius + "m",
                "gps": {
                  "lat": lat,
                  "lon": lon
                }
              }
            }
          );
          // mustDSL.push(
          //   {
          //     "geo_distance": {
          //       "distance": "100m",
          //       "gps": {
          //         "lat": 25.2214361,
          //         "lon": 121.6319685
          //       }
          //     }
          //   }
          // );
        }
      }

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

      if (('key' in s) && (typeof(s.key) === 'string') && (s.key === "distance")) {
        geoDistanceSortMode = true;
        sort = [
          {
            "_geo_distance": {
              "gps": {
                "lat": lat,
                "lon": lon
              },
              "order": s.asc === false ? 'desc' : 'asc',
              "unit": "m"
            }
          },
          {
            "start_time": {
              "order": "asc"
            }
          }
        ];
      } else if (('key' in s) && (typeof(s.key) === 'string')) {
        if (s.key === 'end_time') {
          mustDSL.push(
            {
              exists: {
                field: 'end_time'
              }
            }
          );
        }
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
    // console.log('response: ' + JSON.stringify(response));
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
      if (geoDistanceSortMode && 'sort' in hits[i]) {
        events[i].distance = hits[i].sort[0];
      } else if (geoDistanceReportMode && 'venue' in events[i] && 'latitude' in events[i].venue && 'longitude' in events[i].venue) {
        let distance = calcGPSDistance(events[i].venue.latitude, events[i].venue.longitude,
          lat, lon) * 1000;
          events[i].distance = distance; 

      }
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
 * To get activity data histogram.
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
module.exports.getActivityHistogram = function(params, options, callback) {
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
  let nesteAaggs = {};
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
        aggs.key.terms.field = 'category_list';
      } else if (params.groupField === 'city') {
        aggs.key.terms.field = 'venue.city';
        nesteAaggs = {
          "nested_key": {
            "nested": {
              "path": "venue"
            },
            "aggs": aggs
          }
        }
      } else if (params.groupField === 'type') {
        aggs.key.terms.field = 'freetext_type';
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
        c.city = (c.city === '未分區' ? '' : c.city);
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
        let fIndex = c.city.indexOf('未分區');
        if (fIndex >=0) {
          c.city[fIndex] = '';
        }
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
              category_list: c.category
            }
          }
        );
      } else if (Array.isArray(c.category)) {
        let fIndex = c.category.indexOf('未分類');
        if (fIndex >=0) {
          c.category[fIndex] = '';
        }
        mustDSL.push(
          {
            terms: {
              category_list: c.category
            }
          }
        );
      }
      if (typeof(c.type) === 'string') {
        mustDSL.push(
          {
            term: {
              freetext_type: c.type
            }
          }
        );
      } else if (Array.isArray(c.type)) {
        mustDSL.push(
          {
            terms: {
              freetext_type: c.type
            }
          }
        );
      }

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
        sortKey = '_term';
      }
      if (('asc' in s) && (typeof(s.asc) === 'boolean')) {
        sortOrder = (s.asc === true) ? 'asc' : 'desc';
      }
      aggs.key.terms.order = { [sortKey]: sortOrder };
    }
  }
  searchParams.body.aggs = aggs;
  if (Object.keys(nesteAaggs).length !== 0) {
    searchParams.body.aggs = nesteAaggs;
  }
  searchParams.body.size = 0;
  if (mustDSL.length) {
    searchParams.body.query = {
      bool: {
        must: mustDSL
      }
    };
  }
  console.log('searchParams: ' + JSON.stringify(searchParams));
  conn.client.search(searchParams, function(err, response) {
    if (err) {
      return callback(err);
    }
    let dataStats = [];
    if (response.aggregations.nested_key &&
        response.aggregations.nested_key.key.buckets.length >=1 ) {
      response.aggregations = {
        key: { buckets: JSON.parse(JSON.stringify(
           response.aggregations.nested_key.key.buckets)) }
      };
    }
    console.log('response: ' + JSON.stringify(response));
    if (response.aggregations.key && response.aggregations.key.buckets &&
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
      fields: [ 'name^1.6', 'description^0.8', 'location^1.6', 'location^1.6']
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
//var params =  { groupField: 'city' };
//params.groupField 
// setTimeout(getEventHistogram, 1000, params, options, function(err, datas) {
//   for(var i = 0; i < datas.length; i++) {
//     console.log('data: ' + util.inspect(datas[i], {showHidden: false, depth: null }));
//   }
// })

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

/**
 * To get activity data aggregated by time intervals.
 *
 * @param {Object} [options] Options.
 *   @param {Object} [options.cond] Conditions.
 *     @param {string} [options.cond.id] The event data id.
 *     @param {string|string[]} [options.cond.city] The event city.
 *     @param {string|string[]} [options.cond.category] The event category.
 *     @param {string|string[]} [options.cond.type] The event freetext type.
 *     @param {string} [options.cond.multiMatch] The multi match parameter.
 *       @param {string} [options.cond.multiMatch.query] The query string.
 *       @param {string} [options.cond.multiMatch.fields] The fields to be
 *              queried.
 *     @param {string} [options.cond.timeKey] The date field to filter on.
 *     @param {number} [options.cond.from] The begin time to query.
 *     @param {number} [options.cond.to] The end time to query.
 *   @param {string} [options.group] The date field to aggregate on. Must be one of:
 *          start_time, end_time, created_time, updated_time.
 *   @param {string} [options.interval] Time interval for aggregation. Must be one of:
 *          1m, 5m, 15m, 30m, 1h, 2h, 4h, 12h, 1d, 1w, 1M.
 *   @param {string} [options.timezone] Timezone for the aggregation.
 *   @param {number} [options.limit] Maximum number of buckets to return.
 * @param {function} callback
 *   @param {falsy|Error} callback.err Elasticsearch error message.
 *   @param {Array|null} callback.dataStats An array that contains the following
 *          fields, or <b>null</b> means that no data were found.
 *     @param {number} callback.dataStats.key The timestamp in milliseconds.
 *     @param {string} callback.dataStats.key_as_string The timestamp in ISO 8601 format.
 *     @param {number} callback.dataStats.value Number of events in the time bucket.
 */
module.exports.getActivityDateHistogram = function(options, callback) {
  if (!conn.client) {
    return process.nextTick(function() {
      callback('error');
    });
  }
  
  if (typeof(options) === 'function') {
    callback = options;
  }
  
  var mustDSL = [];
  var searchParams = {
    index: indexName,
    type: typeName,
    body: {
      size: 0,
      aggs: {
        events_over_time: {
          date_histogram: {
            field: options.group,
            interval: options.interval,
            time_zone: options.timezone || "Asia/Taipei",
            min_doc_count: 1
          }
        }
      }
    }
  };

  if (options && (typeof(options) === 'object')) {
    if (options.cond && (typeof(options.cond) === 'object')) {
      var c = options.cond;
      
      // Add time range if specified
      if (typeof(c.from) === 'number' || typeof(c.to) === 'number') {
        let timeRange = {};
        if (typeof(c.from) === 'number') {
          timeRange.gte = new Date(c.from);
        }
        if (typeof(c.to) === 'number') {
          timeRange.lte = new Date(c.to);
        }
        // Ensure we have a valid field name for the range query
        const timeField = c.timeKey || options.group;
        mustDSL.push({
          range: {
            [timeField]: timeRange
          }
        });
      }

      // Add other filters
      if (typeof(c.multiMatch) === 'object' && 
          typeof(c.multiMatch.query) === 'string' &&
          Array.isArray(c.multiMatch.fields) && c.multiMatch.fields.length) {
        mustDSL.push({
          multi_match: {
            query: c.multiMatch.query,
            fields: c.multiMatch.fields
          }
        });
      }

      if (typeof(c.city) === 'string') {
        c.city = (c.city === '未分區' ? '' : c.city);
        mustDSL.push({
          nested: {
            path: "venue",
            query: {
              term: {
                'venue.city': c.city
              }
            }
          }
        });
      }

      if (typeof(c.category) === 'string') {
        mustDSL.push({
          term: {
            category_list: c.category
          }
        });
      }

      if (typeof(c.type) === 'string') {
        mustDSL.push({
          term: {
            freetext_type: c.type
          }
        });
      }
    }
  }

  if (mustDSL.length > 0) {
    searchParams.body.query = {
      bool: {
        must: mustDSL
      }
    };
  }

  // Validate required parameters
  if (!options.group) {
    const error = new Error('Missing required parameter: group');
    console.error('Validation Error:', error.message);
    return callback(error);
  }

  if (!options.interval) {
    const error = new Error('Missing required parameter: interval');
    console.error('Validation Error:', error.message);
    return callback(error);
  }

  // Log the search parameters for debugging
  console.log('Date Histogram Search Parameters:', JSON.stringify(searchParams, null, 2));
  
  conn.client.search(searchParams, function(err, response) {
    if (err) {
      console.error('Elasticsearch Error:', err);
      return callback(err);
    }


    let dataStats = [];
    if (response.aggregations && 
        response.aggregations.events_over_time && 
        response.aggregations.events_over_time.buckets) {
      let buckets = response.aggregations.events_over_time.buckets;
      // Apply limit if specified
      if (options.limit && options.limit > 0) {
        buckets = buckets.slice(0, options.limit);
      }
      for (let i = 0; i < buckets.length; i++) {
        let bucket = buckets[i];
        dataStats.push({
          key: bucket.key,
          key_as_string: bucket.key_as_string,
          value: bucket.doc_count
        });
      }
    } else {
      const error = new Error('No aggregation results found in response');
      console.error('Aggregation Error:', error.message);
      return callback(error);
    }

    callback(null, dataStats);
  });
};