(

function() {
  'use strict';
  var async = require('async');
  var model = require('../../models/eventgo-elasticsearch/activity');
  var queryLogModel = require('../../models/eventgo-elasticsearch/query-log');

  module.exports.getSearchActivity = function(req, res, next) {

    async.waterfall([
      // Check parameters.
      function(cb) {
        var ret = parseGetActivityParams(req.query);
        cb(null, ret.params);
      },
      function(params, cb) {
        // elastic log
        queryLogModel.addUserQuery(params);
        cb(null, params);
      },
      // Get event data.
      function(params, cb) {
        params.multiMatch = {
          query: params.query,
          fields: [ 'name^1.6', 'description^0.8', 'location^1.6' ]
        }
        var timePoint = new Date();//new Date(new Date().getTime() -  730 * 24 * 60 * 60 * 1000);
        var now = new Date();
        var sort = params.sort;
        // var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        //params.timeKey = 'start_time';
        if (!('from' in params)) {
          params.from = timePoint.getTime();
          // params.to = to.getTime();
        }
        //params.to = to;

        var opts = {
          cond: params,
          fields: {
            description: true
          },
          limit: params.num
          // sort: {
          //   key: '_score',
          //   asc: false
          // }
        };

        if (Object.keys(sort).length) {
          opts.sort = sort;
        } else {
          // opts.sort = {
          //   key: '_score',
          //   asc: false
          // }
          opts.sort = {
            key: 'start_time',
            asc: true
          }
        }

        if (params.p > 1) {
          opts.skip = (params.p - 1) * params.num;
        }
        var now = new Date();
        //var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        if ((opts.limit > 0) && (opts.limit <= 1500)) {
          return model.getActivity(opts, function(err, events) {
            var error = {
              message: 'server_error'
            };
            if (err) {
              return cb('server_error');
            }
            //console.log(events['id']);
            queryLogModel.addQueryResult(events);
            res.status(200).json(events || []);
            cb(null);
          });
        }
      }
    ], function(err) {
      if (err) {
        next(err);
      }
    });
  };

  module.exports.getSearchActivityHistogram = function(req, res, next) {

    async.waterfall([
      // Check parameters.
      function(cb) {
        var ret = parseGetActivityHistogramParams(req.query);
        cb(null, ret.params);
      },
      // Get event data.
      function(params, cb) {
        params.multiMatch = {
          query: params.query,
          fields: [ 'name^1.6', 'description^0.8', 'location^1.6' ]
        }
        var group = params.group;
        var timePoint = new Date();//new Date(new Date().getTime() -  730 * 24 * 60 * 60 * 1000);
        var now = new Date();
        var sort = params.sort;
        // var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        //params.timeKey = 'start_time';
        if (!('from' in params)) {
          params.from = timePoint.getTime();
          // params.to = to.getTime();
        }
        //params.to = to;

        var opts = {
          cond: params,
          fields: {
            description: true
          },
          limit: params.num
          // sort: {
          //   key: '_score',
          //   asc: false
          // }
        };

        if (Object.keys(sort).length) {
          opts.sort = sort;
        } else {
          opts.sort = {
            key: 'value',
            asc: false
          }
        }

        var now = new Date();
        //var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        return model.getActivityHistogram( { groupField: group }, opts,
            function(err, datas) {
          var error = {
            message: 'server_error'
          };
          if (err) {
            return cb('server_error');
          }

          res.status(200).json(datas || []);
          cb(null);
        });
      }
    ], function(err) {
      if (err) {
        next(err);
      }
    });
  };

  module.exports.getActivityDateHistogram = function(req, res, next) {
    async.waterfall([
      // Check parameters.
      function(cb) {
        var ret = parseGetActivityDateHistogramParams(req.query);
        if (ret.err) {
          return cb(ret.err);
        }
        cb(null, ret.params);
      },
      // Get event data.
      function(params, cb) {
        params.multiMatch = {
          query: params.query,
          fields: [ 'name^1.6', 'description^0.8', 'location^1.6' ]
        }

        var opts = {
          cond: params,
          fields: {
            description: true
          },
          limit: params.num,
          interval: params.interval,
          timezone: params.timezone || 'Asia/Taipei',
          group: params.group  // Add group parameter
        };

        return model.getActivityDateHistogram(opts, function(err, datas) {
          if (err) {
            return cb('server_error');
          }
          res.status(200).json(datas || []);
          cb(null);
        });
      }
    ], function(err) {
      if (err) {
        next(err);
      }
    });
  };

  function parseGetActivityParams(params) {
    var num = params.num || '100';
    var p = params.p || '1';
    var newParams = {
      sort: {}
    };

    if ('from' in params) {
      if (!params.from || /[^0-9]+/.test(params.from)) {
        return { err: '`from` must be zero or a positive integer.' };
      }
      newParams.from = parseInt(params.from);
    }
    if ('to' in params) {
      if (!params.to || /[^0-9]+/.test(params.to)) {
        return { err: '`to` must be zero or a positive integer.' };
      } else if (('from' in params) && (newParams.from > parseInt(params.to))) {
        return { err: '`to` must equal or bigger than `from`.' };
      }
      newParams.to = parseInt(params.to);
    }
    if ('id' in params) {
      newParams.id = params.id;
    }
    if ('city' in params) {
      newParams.city = params.city.split(',');
      if (newParams.city.length === 1) {
        newParams.city = newParams.city[0];
      }
    }
    if ('category' in params) {
      newParams.category = params.category.split(',');
      if (newParams.category.length === 1) {
        newParams.category = newParams.category[0];
      }
    }
    if ('type' in params) {
      newParams.type = params.type.split(',');
      if (newParams.type.length === 1) {
        newParams.type = newParams.type[0];
      }
    }
    if ('gps' in params) {
      let splitLatLon = params.gps.split(",");
      if (splitLatLon.length === 2 && checkLatLon(splitLatLon[0], splitLatLon[1])) {
        newParams.gps = params.gps;
      } else {
        return { err: 'gps format error.' };
      }
    }
    if ('radius' in params) {
      if (/[^0-9]+/.test(params.radius)) {
        return { err: '`radius` must be a positive integer.' };
      }
      let val = parseInt(params.radius);
      if (val > 0) {
        newParams.radius = parseInt(params.radius);
      } else {
        return { err: '`radius` must be a positive integer.' };
      }
    }
    if ('query' in params) {
      if (params.query !== 'undefined') {
        newParams.query = params.query;
      }
    }
    if ('sort' in params) {
      if (!/^(start_time|hot_count|interested_count|end_time|updated_time|num_mood|num_likes|num_angry|num_ha|num_wow|distance|_score)$/.test(params.sort)) {
        return { err: '`sort` must be `start_time`, `hot_count` , `interested_count` , `end_time`, `updated_time`, `num_mood`, `num_likes`, `num_angry`, `num_ha`, `num_wow`, `distance` or `_score`.' };
      }
      // if (params.sort === 'updated_time') {
      //   params.sort = 'recordUpdateTime';
      // }
      newParams.sort.key = params.sort;
    }
    if ('asc' in params) {
      if (!/^(true|false)$/.test(params.asc)) {
        return { err: '`asc` must be `true` or `false`.' };
      }
      newParams.sort.asc = ((params.asc === 'true') ? true : false);
    }

    if ('timeKey' in params) {
      if (!/^(start_time|end_time)$/.test(params.timeKey)) {
        return { err: '`timeKey` must be `start_time`, `end_time`.' };
      }
      newParams.timeKey = params.timeKey;
    }
    newParams.num = parseInt(num);
    newParams.p = parseInt(p);
    return { err: null, params: newParams };
  }

  function parseGetActivityHistogramParams(params) {
    var num = params.num || '20';
    var newParams = {
      sort: {}
    };

    if ('group' in params) {
      if (!/^(category|city|type)$/.test(params.group)) {
        return { err: '`group` must be `category` , `city` or `type`.' };
      }
      newParams.group = params.group;
    }
    if ('from' in params) {
      if (!params.from || /[^0-9]+/.test(params.from)) {
        return { err: '`from` must be zero or a positive integer.' };
      }
      newParams.from = parseInt(params.from);
    }
    if ('to' in params) {
      if (!params.to || /[^0-9]+/.test(params.to)) {
        return { err: '`to` must be zero or a positive integer.' };
      } else if (('from' in params) && (newParams.from > parseInt(params.to))) {
        return { err: '`to` must equal or bigger than `from`.' };
      }
      newParams.to = parseInt(params.to);
    }
    if ('id' in params) {
      newParams.id = params.id;
    }
    if ('city' in params) {
      newParams.city = params.city.split(',');
      if (newParams.city.length === 1) {
        newParams.city = newParams.city[0];
      }
    }
    if ('category' in params) {
      newParams.category = params.category.split(',');
      if (newParams.category.length === 1) {
        newParams.category = newParams.category[0];
      }
    }
    if ('type' in params) {
      newParams.type = params.type.split(',');
      if (newParams.type.length === 1) {
        newParams.type = newParams.type[0];
      }
    }
    if ('gps' in params) {
      let splitLatLon = params.gps.split(",");
      if (splitLatLon.length === 2 && checkLatLon(splitLatLon[0], splitLatLon[1])) {
        newParams.gps = params.gps;
      } else {
        return { err: 'gps format error.' };
      }
    }
    if ('radius' in params) {
      if (/[^0-9]+/.test(params.radius)) {
        return { err: '`radius` must be a positive integer.' };
      }
      let val = parseInt(params.radius);
      if (val > 0) {
        newParams.radius = parseInt(params.radius);
      } else {
        return { err: '`radius` must be a positive integer.' };
      }
    }
    if ('query' in params) {
      if (params.query !== 'undefined') {
        newParams.query = params.query;
      }
    }
    if ('sort' in params) {
      if (!/^(value|key)$/.test(params.sort)) {
        return { err: '`sort` must be `value` or `key`.' };
      }
      newParams.sort.key = params.sort;
    }
    if ('asc' in params) {
      if (!/^(true|false)$/.test(params.asc)) {
        return { err: '`asc` must be `true` or `false`.' };
      }
      newParams.sort.asc = ((params.asc === 'true') ? true : false);
    }
    newParams.num = parseInt(num);
    return { err: null, params: newParams };
  }

  function parseGetActivityDateHistogramParams(params) {
    var num = params.num || '100';
    var newParams = {
      sort: {}
    };

    // Required parameter: interval
    if ('interval' in params) {
      if (!/^(1m|5m|15m|30m|1h|2h|4h|12h|1d|1w|1M)$/.test(params.interval)) {
        return { err: '`interval` must be one of: 1m, 5m, 15m, 30m, 1h, 2h, 4h, 12h, 1d, 1w, 1M' };
      }
      newParams.interval = params.interval;
    } else {
      return { err: '`interval` is required' };
    }

    // Required parameter: group
    if ('group' in params) {
      if (!/^(start_time|end_time|created_time|updated_time)$/.test(params.group)) {
        return { err: '`group` must be one of: start_time, end_time, created_time, updated_time' };
      }
      newParams.group = params.group;
    } else {
      return { err: '`group` is required' };
    }

    // Optional parameter: timezone
    if ('timezone' in params) {
      newParams.timezone = params.timezone;
    }

    // Optional parameter: timeKey
    if ('timeKey' in params) {
      if (!/^(start_time|end_time|created_time|updated_time)$/.test(params.timeKey)) {
        return { err: '`timeKey` must be one of: start_time, end_time, created_time, updated_time' };
      }
      newParams.timeKey = params.timeKey;
    }

    // Optional parameter: from
    if ('from' in params) {
      if (!params.from || /[^0-9]+/.test(params.from)) {
        return { err: '`from` must be zero or a positive integer.' };
      }
      newParams.from = parseInt(params.from);
    }

    // Optional parameter: to
    if ('to' in params) {
      if (!params.to || /[^0-9]+/.test(params.to)) {
        return { err: '`to` must be zero or a positive integer.' };
      } else if (('from' in params) && (newParams.from > parseInt(params.to))) {
        return { err: '`to` must equal or bigger than `from`.' };
      }
      newParams.to = parseInt(params.to);
    }

    // Optional parameter: id
    if ('id' in params) {
      newParams.id = params.id;
    }

    // Optional parameter: city
    if ('city' in params) {
      newParams.city = params.city.split(',');
      if (newParams.city.length === 1) {
        newParams.city = newParams.city[0];
      }
    }

    // Optional parameter: category
    if ('category' in params) {
      newParams.category = params.category.split(',');
      if (newParams.category.length === 1) {
        newParams.category = newParams.category[0];
      }
    }

    // Optional parameter: type
    if ('type' in params) {
      newParams.type = params.type.split(',');
      if (newParams.type.length === 1) {
        newParams.type = newParams.type[0];
      }
    }

    // Optional parameter: query
    if ('query' in params) {
      if (params.query !== 'undefined') {
        newParams.query = params.query;
      }
    }

    // Optional parameter: num
    if ('num' in params) {
      if (!params.num || /[^0-9]+/.test(params.num)) {
        return { err: '`num` must be a positive integer.' };
      }
      newParams.num = parseInt(params.num);
    } else {
      newParams.num = parseInt(num);
    }

    return { err: null, params: newParams };
  }

  const CHECK_LAT = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  const CHECK_LON = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
  function checkLatLon(lat, lon){
    var validLat = CHECK_LAT.test(lat);
    var validLon = CHECK_LON.test(lon);
    if(validLat && validLon) {
        return true;
    } else {
        return false;
    }
  }

})();
