(

function() {
  'use strict';
  var async = require('async');
  var model = require('../../models/eventgo-elasticsearch/event');
  var queryLogModel = require('../../models/eventgo-elasticsearch/query-log');

  module.exports.getSearchEvent = function(req, res, next) {

    async.waterfall([
      // Check parameters.
      function(cb) {
        var ret = parseGeEventParams(req.query);
        cb(null, ret.params);
      },
      function(params, cb) {
        // elastic logjh
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
        var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        //params.timeKey = 'start_time';
        if (!('from' in params)) {
          params.from = timePoint.getTime();
          params.to = to.getTime();
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
        if ((opts.limit > 0) && (opts.limit <= 100)) {
          return model.getEvent(opts, function(err, events) {
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

  module.exports.getSearchEventHistogram = function(req, res, next) {

    async.waterfall([
      // Check parameters.
      function(cb) {
        var ret = parseGeEventHistogramParams(req.query);
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
        var to = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        //params.timeKey = 'start_time';
        if (!('from' in params)) {
          params.from = timePoint.getTime();
          params.to = to.getTime();
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
        return model.getEventHistogram( { groupField: group }, opts,
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

  function parseGeEventParams(params) {
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
    if ('gps' in params) {
      newParams.gps = params.gps;
    }
    if ('query' in params) {
      if (params.query !== 'undefined') {
        newParams.query = params.query;
      }
    }
    if ('sort' in params) {
      if (!/^(start_time|interested_count|end_time|updated_time|_score)$/.test(params.sort)) {
        return { err: '`sort` must be `start_time`, `interested_count` , `end_time`, `updated_time` or `_score`.' };
      }
      if (params.sort === 'updated_time') {
        params.sort = 'recordUpdateTime';
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
    newParams.p = parseInt(p);
    return { err: null, params: newParams };
  }

  function parseGeEventHistogramParams(params) {
    var num = params.num || '20';
    var newParams = {
      sort: {}
    };

    if ('group' in params) {
      if (!/^(category|city)$/.test(params.group)) {
        return { err: '`group` must be `category` or `city`.' };
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
    if ('gps' in params) {
      newParams.gps = params.gps;
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

})();
