/*!
 *	ng-quick-table
 * 
 * Copyright(c) 2015 Eisneim Terry
 * MIT Licensed
 */

'use strict';

var ngQT = angular.module('ngQuickTable',[]);

ngQT.provider("ngQuickTableDefaults", function() {
    return {
      options: {
        dateFormat: 'M/d/yyyy',
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

// ngQT.run()