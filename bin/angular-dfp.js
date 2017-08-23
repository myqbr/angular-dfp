/**
 * @license Apache
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var angularDfp = angular.module('angularDfp', []);


( function (module) {
  'use strict';


  function httpErrorFactory($log) {
    function httpError(response, message) {
      $log.error('Error (' + response.status + ')');
    }

    httpError.isErrorCode = function (code) {
      if (typeof code === 'number') {
        return !(code >= 200 && code < 300);
      }

      console.assert(typeof code === 'string');

      return code[0] !== '2';
    };

    return httpError;
  }

  module.factory('httpError', ['$log', httpErrorFactory]);

})(angularDfp);


( function (module) {
  'use strict';


  var DFPDurationError = function (_Error) {
    _inherits(DFPDurationError, _Error);

    function DFPDurationError(interval) {
      _classCallCheck(this, DFPDurationError);

      return _possibleConstructorReturn(this, (DFPDurationError.__proto__ || Object.getPrototypeOf(DFPDurationError)).call(this, 'Invalid interval: \'' + interval + '\'ls'));
    }

    return DFPDurationError;
  }(Error);



  function parseDurationFactory() {
    function convertToMilliseconds(time, unit) {
      console.assert(/^(m?s|min|h)$/g.test(unit));

      if (unit === 'ms') return time;
      if (unit === 's') return time * 1000;
      if (unit === 'min') return time * 60 * 1000;

      return time * 60 * 60 * 1000;
    }

    function convert(match) {
      var time = parseFloat(match[1]);

      if (match.length === 2) return time;

      return convertToMilliseconds(time, match[2]);
    }

    function parseDuration(interval) {
      if (interval === undefined || interval === null) {
        throw new DFPDurationError(interval);
      }

      if (typeof interval === 'number') {
        return interval;
      }

      if (typeof interval !== 'string') {
        throw new TypeError('\'' + interval + '\' must be of number or string type');
      }

      var match = interval.match(/((?:\d+)?.?\d+)(m?s|min|h)?/);

      if (!match) {
        throw new DFPDurationError(interval);
      }

      return convert(match);
    }

    return parseDuration;
  }

  module.factory('parseDuration', parseDurationFactory);

})(angularDfp);


( function (module) {
  'use strict';


  function scriptInjectorFactory($q, httpError) {
    function createScript(url) {
      var script = document.createElement('script');
      var ssl = document.location.protocol === 'https:';

      script.async = 'async';
      script.type = 'text/javascript';
      script.src = (ssl ? 'https:' : 'http:') + url;

      return script;
    }

    function promiseScript(script, url) {
      var deferred = $q.defer();

      function resolve() {
        deferred.resolve();
      }

      function reject(response) {
        response = response || { status: 400 };
        httpError(response, 'loading script "{0}".', url);

        deferred.reject(response);
      }

      script.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (httpError.isErrorCode(this.status)) {
            reject(this);
          } else {
            resolve();
          }
        }
      };

      script.onload = resolve;
      script.onerror = reject;

      return deferred.promise;
    }

    function injectScript(script) {
      var head = document.head || document.querySelector('head');
      head.appendChild(script);
    }

    function scriptInjector(url) {
      var script = createScript(url);
      injectScript(script);
      return promiseScript(script, url);
    }

    return scriptInjector;
  }

  module.factory('scriptInjector', ['$q', 'httpError', scriptInjectorFactory]);

})(angularDfp);


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

( function (module) {
  'use strict';


  function dfpAdController(DFPIncompleteError) {
    var sizes = [];

    var responsiveMapping = [];

    var targetings = [];

    var exclusions = [];

    var scripts = [];

    this.booleanProperty = function (name) {
      return this[name] !== undefined;
    };

    this.checkValid = function () {
      if (sizes.length === 0) {
        throw new DFPIncompleteError('dfp-ad', 'dfp-size');
      }
      if (!this['adUnit']) {
        throw new DFPIncompleteError('dfp-ad', 'ad-unit', true);
      }
    };

    this.getState = function () {
      this.checkValid();
      return Object.freeze({
        sizes: sizes,
        responsiveMapping: responsiveMapping,
        targetings: targetings,
        exclusions: exclusions,
        adUnit: this['adUnit'],
        forceSafeFrame: this.booleanProperty('forceSafeFrame'),
        safeFrameConfig: this['safeFrameConfig'],
        clickUrl: this['clickUrl'],
        refresh: this['refresh'],
        scripts: scripts,
        collapseIfEmpty: this.booleanProperty('collapseIfEmpty')
      });
    };

    this.addSize = function (size) {
      sizes.push(size);
    };

    this.addResponsiveMapping = function (mapping) {
      responsiveMapping.push(mapping);
    };

    this.addTargeting = function (targeting) {
      targetings.push(targeting);
    };

    this.addExclusion = function (exclusion) {
      exclusions.push(exclusion);
    };

    this.addScript = function (script) {
      scripts.push(script);
    };
  }

  function dfpAdDirective(scope, element, attributes, controller, $injector) {
    var dfp = $injector.get('dfp');
    var dfpIDGenerator = $injector.get('dfpIDGenerator');
    var dfpRefresh = $injector.get('dfpRefresh');
    var dfpResponsiveResize = $injector.get('dfpResponsiveResize');

    var ad = controller.getState();

    var jQueryElement = element;
    element = element[0];

    dfpIDGenerator(element);

    function addResponsiveMapping(slot) {
      if (ad.responsiveMapping.length === 0) return;

      var sizeMapping = googletag.sizeMapping();

      ad.responsiveMapping.forEach(function (mapping) {
        sizeMapping.addSize(mapping.viewportSize, mapping.adSizes);
      });

      slot.defineSizeMapping(sizeMapping.build());
    }

    function extractViewportDimensions(responsiveMappings) {
      return responsiveMappings.map(function (mapping) {
        return {
          width: mapping.viewportSize[0],
          height: mapping.viewportSize[1]
        };
      });
    }

    function defineSlot() {
      var slot = googletag.defineSlot(ad.adUnit, ad.sizes, element.id);

      if (ad.forceSafeFrame !== undefined) {
        slot.setForceSafeFrame(true);
      }

      if (ad.clickUrl) {
        slot.setClickUrl(ad.clickUrl);
      }

      if (ad.collapseIfEmpty) {
        slot.setCollapseEmptyDiv(true, true);
      }

      if (ad.safeFrameConfig) {
        slot.setSafeFrameConfig(
        JSON.parse(ad.safeFrameConfig));
      }

      addResponsiveMapping(slot);

      ad.targetings.forEach(function (targeting) {
        slot.setTargeting(targeting.key, targeting.values);
      });

      ad.exclusions.forEach(function (exclusion) {
        slot.setCategoryExclusion(exclusion);
      });

      ad.scripts.forEach(function (script) {
        script(slot);
      });

      slot.addService(googletag.pubads());

      googletag.display(element.id);

      dfpRefresh(slot, ad.refresh).then(function () {
        if (ad.responsiveMapping.length > 0) {
          var dimensions = extractViewportDimensions(ad.responsiveMapping);
          dfpResponsiveResize(jQueryElement, slot, dimensions);
        }
      });

      scope.$on('$destroy', function () {
        console.assert(googletag.destroySlots([slot]));
      });
    }

    dfp.then(defineSlot);
  }

  module.directive('dfpAd', ['$injector', function ($injector) {
    return {
      restrict: 'AE',
      controller: ['DFPIncompleteError', dfpAdController],
      controllerAs: 'controller',
      bindToController: true,
      link: function link() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        dfpAdDirective.apply(null, args.slice(0, 4).concat($injector));
      },
      scope: {
        'adUnit': '@',
        'clickUrl': '@',
        'forceSafeFrame': '@',
        'safeFrameConfig': '@',
        'refresh': '@',
        'collapseIfEmpty': '@'
      }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpAudiencePixelDirective(scope, element, attributes) {
    var axel = String(Math.random());
    var random = axel * 10000000000000;


    var adUnit = '';
    if (scope.adUnit) {
      adUnit = 'dc_iu=' + scope['adUnit'];
    }

    var ppid = '';
    if (scope.ppid) {
      ppid = 'ppid=' + scope['ppid'];
    }

    var pixel = document.createElement('img');

    pixel.src = 'https://pubads.g.doubleclick.net/activity;ord=';
    pixel.src += random + ';dc_seg=' + scope['segmentId'] + ';' + adUnit + ppid;


    pixel.width = 1;
    pixel.height = 1;
    pixel.border = 0;
    pixel.style.visibility = 'hidden';

    element.append(pixel);
  }

  module.directive('dfpAudiencePixel', [function () {
    return {
      restrict: 'E',
      link: dfpAudiencePixelDirective,
      scope: { 'adUnit': '@', 'segmentId': '@', 'ppid': '@' }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpIncompleteErrorFactory() {
    var DFPIncompleteError = function (_Error2) {
      _inherits(DFPIncompleteError, _Error2);

      function DFPIncompleteError(directiveName, missingName, isAttribute) {
        _classCallCheck(this, DFPIncompleteError);

        return _possibleConstructorReturn(this, (DFPIncompleteError.__proto__ || Object.getPrototypeOf(DFPIncompleteError)).call(this, 'Incomplete definition of \'' + directiveName + '\': ' + ('Missing ' + (isAttribute ? 'attribute' : 'child directive') + ' ') + ('\'' + missingName + '\'.')));
      }

      return DFPIncompleteError;
    }(Error);

    return DFPIncompleteError;
  }

  function dfpTypeErrorFactory() {
    var DFPTypeError = function (_Error3) {
      _inherits(DFPTypeError, _Error3);

      function DFPTypeError(directiveName, attributeName, wrongValue, expectedType) {
        _classCallCheck(this, DFPTypeError);

        return _possibleConstructorReturn(this, (DFPTypeError.__proto__ || Object.getPrototypeOf(DFPTypeError)).call(this, 'Wrong type for attribute \'' + attributeName + '\' on ' + ('directive \'' + directiveName + '\': Expected ' + expectedType) + (', got ' + (typeof wrongValue === 'undefined' ? 'undefined' : _typeof(wrongValue)))));
      }

      return DFPTypeError;
    }(Error);

    return DFPTypeError;
  }
  function dfpMissingParentErrorFactory() {
    var DFPMissingParentError = function (_Error4) {
      _inherits(DFPMissingParentError, _Error4);

      function DFPMissingParentError(directiveName) {
        for (var _len2 = arguments.length, parents = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          parents[_key2 - 1] = arguments[_key2];
        }

        _classCallCheck(this, DFPMissingParentError);

        console.assert(parents && parents.length > 0);
        if (Array.isArray(parents[0])) {
          parents = parents[0];
        }

        var parentMessage = void 0;
        if (parents.length > 1) {
          parents = parents.map(function (p) {
            return '\'' + p + '\'';
          });
          parentMessage = ', which must be ';
          parentMessage += parents.slice(0, -1).join(', ');
          parentMessage += ' or ' + parents[parents.length - 1];
        } else {
          parentMessage = ' \'' + parents[0] + '\'';
        }

        return _possibleConstructorReturn(this, (DFPMissingParentError.__proto__ || Object.getPrototypeOf(DFPMissingParentError)).call(this, 'Invalid use of \'' + directiveName + '\' directive. ' + ('Missing parent directive' + parentMessage + '.')));
      }

      return DFPMissingParentError;
    }(Error);

    return DFPMissingParentError;
  }

  module.factory('DFPIncompleteError', dfpIncompleteErrorFactory);
  module.factory('DFPTypeError', dfpTypeErrorFactory);
  module.factory('DFPMissingParentError', dfpMissingParentErrorFactory);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpExclusionDirective(scope, element, attributes, ad) {
    ad.addExclusion(element.html());
  }

  module.directive('dfpExclusion', [function () {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      link: dfpExclusionDirective
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpIDGeneratorFactory() {
    var generatedIDs = {};

    function generateID() {
      var id = null;

      do {
        var number = Math.random().toString().slice(2);
        id = 'gpt-ad-' + number;
      } while (id in generatedIDs);

      generatedIDs[id] = true;

      return id;
    }

    function dfpIDGenerator(element) {
      if (element && element.id && !(element.id in generatedIDs)) {
        return element.id;
      }

      var id = generateID();
      if (element) element.id = id;

      return id;
    }

    dfpIDGenerator.isTaken = function (id) {
      return id in generatedIDs;
    };

    dfpIDGenerator.isUnique = function (id) {
      return !dfpIDGenerator.isTaken(id);
    };

    return dfpIDGenerator;
  }

  module.factory('dfpIDGenerator', [dfpIDGeneratorFactory]);

})(angularDfp);


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

( function (module) {
  'use strict';


  var DFPRefreshError = function (_Error5) {
    _inherits(DFPRefreshError, _Error5);

    function DFPRefreshError() {
      _classCallCheck(this, DFPRefreshError);

      return _possibleConstructorReturn(this, (DFPRefreshError.__proto__ || Object.getPrototypeOf(DFPRefreshError)).apply(this, arguments));
    }

    return DFPRefreshError;
  }(Error);



  function dfpRefreshProvider() {
    var self = this;

    self.bufferInterval = null;

    self.bufferBarrier = null;

    self.oneShotBarrier = true;

    self.refreshInterval = null;

    self.priority = {
      'refresh': 1,
      'interval': 1,
      'barrier': 1
    };

    self.$get = ['$rootScope', '$interval', '$q', '$log', 'parseDuration', function ($rootScope, $interval, $q, $log, parseDuration) {
      var Options = Object.freeze({
        REFRESH: 'refresh',
        INTERVAL: 'interval',
        BARRIER: 'barrier'
      });

      dfpRefresh.Options = Object.freeze({
        'REFRESH': Options.REFRESH,
        'INTERVAL': Options.INTERVAL,
        'BARRIER': Options.BARRIER
      });

      var buffer = [];

      var intervals = { refresh: null, buffer: null };

      var isEnabled = Object.seal({
        refresh: self.refreshInterval !== null,
        interval: self.bufferInterval !== null,
        barrier: self.bufferBarrier !== null
      });

      function dfpRefresh(slot, interval, defer) {
        var deferred = $q.defer();
        var task = { slot: slot, deferred: deferred };

        if (interval) {
          addSlotInterval(task, interval);
        }

        if (!interval || !defer) {
          scheduleRefresh(task);
        }

        return deferred.promise;
      }

      dfpRefresh.cancelInterval = function (slot) {
        if (!dfpRefresh.hasSlotInterval(slot)) {
          throw new DFPRefreshError("No interval for given slot");
        }

        $interval.cancel(intervals[slot]);
        delete intervals[slot];

        return dfpRefresh;
      };

      dfpRefresh.hasSlotInterval = function (slot) {
        return slot in intervals;
      };

      dfpRefresh.setBufferInterval = function (interval) {
        self.bufferInterval = parseDuration(interval);
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.clearBufferInterval = function () {
        if (!dfpRefresh.hasBufferInterval()) {
          console.warn("clearBufferInterval had no " + "effect because no interval was set.");
          return dfpRefresh;
        }

        disableBufferInterval();
        self.bufferInterval = null;

        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.hasBufferInterval = function () {
        return self.bufferInterval !== null;
      };

      dfpRefresh.bufferIntervalIsEnabled = function () {
        return isEnabled.interval;
      };

      dfpRefresh.getBufferInterval = function () {
        return self.bufferInterval;
      };

      dfpRefresh.setBufferBarrier = function (numberOfAds, oneShot) {
        self.bufferBarrier = numberOfAds;
        self.oneShotBarrier = oneShot === undefined ? true : oneShot;
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.clearBufferBarrier = function () {
        if (!dfpRefresh.hasBufferBarrier()) {
          console.warn("clearBufferBarrier had not effect because " + "no barrier was set.");
          return dfpRefresh;
        }

        self.bufferBarrier = null;
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.getBufferBarrier = function () {
        return self.bufferBarrier;
      };

      dfpRefresh.hasBufferBarrier = function () {
        return self.bufferBarrier !== null;
      };

      dfpRefresh.bufferBarrierIsEnabled = function () {
        return isEnabled.barrier;
      };

      dfpRefresh.bufferBarrierIsOneShot = function () {
        return self.oneShotBarrier;
      };

      dfpRefresh.setRefreshInterval = function (interval) {
        self.refreshInterval = parseDuration(interval);
        validateInterval(self.refreshInterval, interval);
        enableRefreshInterval();
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.hasRefreshInterval = function () {
        return self.refreshInterval !== null;
      };

      dfpRefresh.refreshIntervalIsEnabled = function () {
        return isEnabled.refresh;
      };

      dfpRefresh.clearRefreshInterval = function () {
        if (!dfpRefresh.hasRefreshInterval()) {
          console.warn("clearRefreshInterval had no effect because " + "no refresh interval was set.");
        }

        disableRefreshInterval();
        prioritize();

        return dfpRefresh;
      };

      dfpRefresh.getRefreshInterval = function () {
        return self.refreshInterval;
      };

      dfpRefresh.isBuffering = function () {
        return isEnabled.barrier || isEnabled.interval;
      };

      dfpRefresh.has = function (option) {
        switch (option) {
          case Options.REFRESH:
            return dfpRefresh.hasRefreshInterval();
          case Options.INTERVAL:
            return dfpRefresh.hasBufferInterval();
          case Options.BARRIER:
            return dfpRefresh.hasBufferBarrier();
          default:
            throw new DFPRefreshError('Invalid option \'' + option + '\'');
        }
      };

      dfpRefresh.setPriority = function (option, priority) {
        ensureValidOption(option);
        ensureValidPriority(priority);
        self.priority[option] = priority;

        return dfpRefresh;
      };

      dfpRefresh.getPriority = function (option) {
        ensureValidOption(option);
        return self.priority[option];
      };

      dfpRefresh.setRefreshPriority = function (priority) {
        ensureValidPriority(priority);
        dfpRefresh.setPriority('refresh', priority);
      };

      dfpRefresh.getRefreshPriority = function () {
        return dfpRefresh.getPriority('refresh');
      };

      dfpRefresh.setBarrierPriority = function (priority) {
        ensureValidPriority(priority);
        dfpRefresh.setPriority('barrier', priority);
      };

      dfpRefresh.getBarrierPriority = function () {
        return dfpRefresh.getPriority('barrier');
      };

      dfpRefresh.setIntervalPriority = function (priority) {
        ensureValidPriority(priority);
        dfpRefresh.setPriority('interval', priority);
      };

      dfpRefresh.getIntervalPriority = function () {
        return dfpRefresh.getPriority('interval');
      };

      function ensureValidOption(option) {
        if (!(option in Options)) {
          throw new DFPRefreshError('Invalid option \'' + option + '\'');
        }
      }

      function ensureValidPriority(priority) {
        if (typeof priority !== 'number') {
          throw new DFPRefreshError('Priority \'' + priority + '\' is not a number');
        }
      }

      function enable(option, yes) {
        if (yes === false) {
          disable(option);
          return;
        }

        switch (option) {
          case Options.REFRESH:
            enableRefreshInterval();break;
          case Options.INTERVAL:
            enableBufferInterval();break;
          case Options.BARRIER:
            enableBufferBarrier();break;
          default:
            console.assert(false);
        }
      }

      function disable(option) {
        switch (option) {
          case Options.REFRESH:
            disableRefreshInterval();break;
          case Options.INTERVAL:
            disableBufferInterval();break;
          case Options.BARRIER:
            disableBufferBarrier();break;
          default:
            console.assert(false);
        }
      }

      function prioritize() {
        var options = Object.keys(Options).map(function (key) {
          return Options[key];
        });

        var available = options.filter(dfpRefresh.has);

        var priorities = available.map(function (option) {
          return self.priority[option];
        });

        var maximum = null;
        if (priorities.length > 0) {
          maximum = priorities.reduce(function (a, b) {
            return Math.max(a, b);
          });
        }

        for (var index = 0; index < available.length; ++index) {
          if (priorities[index] === maximum) {
            enable(available[index]);
          } else {
            disable(available[index]);
          }
        }
      }

      function refresh(tasks) {
        console.assert(tasks === undefined || tasks !== null);

        if (tasks === undefined) {
          googletag.cmd.push(function () {
            googletag.pubads().refresh();
          });
          return;
        }

        if (tasks.length === 0) return;

        tasks = tasks.filter(function (pair) {
          return pair !== null;
        });

        googletag.cmd.push(function () {
          googletag.pubads().refresh(tasks.map(function (task) {
            return task.slot;
          }));
          tasks.forEach(function (task) {
            return task.deferred.resolve();
          });
        });
      }

      function flushBuffer() {
        refresh(buffer);
        buffer = [];
      }

      function enableRefreshInterval() {
        console.assert(dfpRefresh.hasRefreshInterval());

        var task = function task() {
          clearBufferRespectingBarrier();

          refresh();
        };

        var promise = $interval(task, self.refreshInterval);
        intervals.refresh = promise;
        isEnabled.refresh = true;
      }

      function disableRefreshInterval() {
        if (isEnabled.refresh) {
          $interval.cancel(intervals.refresh);
          intervals.refresh = null;
          isEnabled.refresh = false;
        }
      }

      function enableBufferInterval() {
        console.assert(dfpRefresh.hasBufferInterval());

        var task = function task() {
          refresh(buffer);
          clearBufferRespectingBarrier();
        };

        var promise = $interval(task, self.bufferInterval);
        intervals.buffer = promise;
        isEnabled.interval = true;
      }

      function disableBufferInterval() {
        if (isEnabled.interval) {
          $interval.cancel(intervals.buffer);
          intervals.buffer = null;
          isEnabled.interval = false;
        }
      }

      function enableBufferBarrier() {
        console.assert(dfpRefresh.hasBufferBarrier());
        isEnabled.barrier = true;
      }

      function disableBufferBarrier() {
        isEnabled.barrier = false;
      }

      function clearBufferRespectingBarrier() {
        if (isEnabled.barrier) {
          for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = null;
          }
        } else {
          buffer = [];
        }
      }

      function addSlotInterval(task, interval) {
        var parsedInterval = parseDuration(interval);
        validateInterval(parsedInterval, interval);

        var promise = $interval(function () {
          scheduleRefresh(task);
        }, parsedInterval);

        intervals[task.slot] = promise;
      }

      function scheduleRefresh(task) {
        if (dfpRefresh.isBuffering()) {
          bufferRefresh(task);
        } else {
          refresh([task]);
        }
      }

      function bufferRefresh(task) {
        buffer.push(task);

        if (!isEnabled[Options.BARRIER]) return;
        if (buffer.length === self.bufferBarrier) {
          flushBuffer();
          if (self.oneShotBarrier) {
            dfpRefresh.clearBufferBarrier();
          }
        }
      }

      function validateInterval(milliseconds, beforeParsing) {
        console.assert(milliseconds);
        if (milliseconds < 500) {
          $log.warn('Careful: ${beforeParsing} is quite a low interval!');
        }
      }

      $rootScope.$on('$destroy', function () {
        intervals.forEach(function (promise) {
          $interval.cancel(promise);
        });
      });

      if (self.refreshInterval) {
        self.refreshInterval = parseDuration(self.refreshInterval);
      }

      if (self.bufferInterval) {
        self.bufferInterval = parseDuration(self.bufferInterval);
      }

      prioritize();

      return dfpRefresh;
    }];
  }

  module.provider('dfpRefresh', [dfpRefreshProvider]);
})(angularDfp);


( function (module) {
  'use strict';


  function dfpResponsiveResizeProvider() {
    var self = this;

    self.refreshDelay = 200;

    this.$get = ['$interval', '$timeout', '$window', 'dfpRefresh', 'parseDuration', function ($interval, $timeout, $window, dfpRefresh, parseDuration) {
      $window = angular.element($window);

      self.refreshDelay = parseDuration(self.refreshDelay);

      function responsiveResize(element, slot, dimensions) {
        dimensions.sort(function (first, second) {
          if (first.width < second.width) return -1;
          if (first.width > second.width) return +1;

          if (first.height < second.height) return -1;
          if (first.height > second.height) return +1;

          return 0;
        });

        var POLL_INTERVAL = 100; 

        var POLL_DURATION = 2500; 

        function queryIFrame() {
          return element.find('div iframe');
        }

        function normalizeIFrame(iframe) {
          iframe = iframe || queryIFrame();
          iframe.css('width', iframe.attr('width') + 'px');
          iframe.css('height', iframe.attr('height') + 'px');
        }

        function pollForChange(initial) {
          var iframe = queryIFrame();

          var change = ['width', 'height'].some(function (dimension) {
            return iframe.attr(dimension) !== initial[dimension];
          });

          if (change) {
            normalizeIFrame(iframe);
            element.parent().removeClass('refreshing');
          }
        }

        function startPolling(initial) {
          var poll = $interval(function () {
            return pollForChange(initial);
          }, POLL_INTERVAL);

          $timeout(function () {
            return $interval.cancel(poll);
          }, POLL_DURATION);
        }

        function getIframeDimensions() {
          var iframe = queryIFrame();
          var dimensions = [iframe.css('width'), iframe.css('height')];

          var plain = dimensions.map(function (dimension) {
            return dimension ? dimension.slice(0, -2) : null;
          });

          return { width: plain[0], height: plain[1] };
        }

        function watchResize() {
          startPolling(getIframeDimensions());

          $window.on('resize', function () {
            normalizeIFrame();
          });
        }

        function makeResponsive() {
          function determineIndex() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var numberOfDimensions = dimensions.length;

            var index = 1;
            for (; index < numberOfDimensions; ++index) {
              if (width < dimensions[index].width) break;
              if (height < dimensions[index].height) break;
            }

            return index - 1;
          }

          var index = determineIndex();

          function couldGrow() {
            if (index + 1 >= dimensions.length) return false;
            if (window.innerWidth < dimensions[index + 1].width) {
              return false;
            }
            if (window.innerHeight < dimensions[index + 1].height) {
              return false;
            }

            return true;
          }

          function couldShrink() {
            if (index === 0) return false;
            if (window.innerWidth < dimensions[index].width) return true;
            if (window.innerHeight < dimensions[index].height) return true;
            return false;
          }

          function refresh() {
            dfpRefresh(slot).then(function () {
              watchResize();
            });
          }

          function transition(delta) {
            console.assert(index >= 0 && index < dimensions.length);
            console.assert(delta === -1 || delta === +1);

            index += delta;

            element.parent().addClass('refreshing');

            $timeout(refresh, self.refreshDelay);

            console.assert(index >= 0 && index < dimensions.length);
          }

          watchResize();

          return function watchListener() {
            if (couldGrow()) {
              transition(+1);
            } else if (couldShrink()) {
              transition(-1);
            }
          };
        }

        $window.on('resize', makeResponsive());
      }

      return responsiveResize;
    }];
  }

  module.provider('dfpResponsiveResize', dfpResponsiveResizeProvider);

})(angularDfp);


( function (module) {
  'use strict';


  function DFPResponsiveController(DFPIncompleteError, DFPTypeError) {
    var viewportSize = Object.seal([this['viewportWidth'], this['viewportHeight'] || 0]);

    var adSizes = [];

    this.checkValid = function () {
      var _this6 = this;

      ['viewportWidth', 'viewportHeight'].forEach(function (dimension) {
        var value = _this6[dimension];
        if (typeof value !== 'number') {
          dimension = dimension.replace(/[A-Z]/g, function (m) {
            return '-' + m.toLowerCase();
          });
          throw new DFPTypeError('dfp-responsive', dimension, value, 'number');
        }
      });

      if (adSizes.length === 0) {
        throw new DFPIncompleteError('dfp-responsive', 'dfp-size', false);
      }
    };

    this.addSize = function (size) {
      adSizes.push(size);
    };

    this.getState = function () {
      this.checkValid();
      return Object.freeze({
        viewportSize: viewportSize,
        adSizes: adSizes
      });
    };
  }

  DFPResponsiveController.$inject = ['$scope'];

  function dfpResponsiveDirective(scope, element, attributes, ad) {
    var mapping = scope.controller.getState();
    ad.addResponsiveMapping(mapping);
  }

  module.directive('dfpResponsive', [function () {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      controller: ['DFPIncompleteError', 'DFPTypeError', DFPResponsiveController],
      controllerAs: 'controller',
      bindToController: true,
      link: dfpResponsiveDirective,
      scope: { 'viewportWidth': '=', 'viewportHeight': '=' }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  var DFPScriptError = function (_Error6) {
    _inherits(DFPScriptError, _Error6);

    function DFPScriptError(response) {
      _classCallCheck(this, DFPScriptError);

      return _possibleConstructorReturn(this, (DFPScriptError.__proto__ || Object.getPrototypeOf(DFPScriptError)).call(this, 'Error (' + response.status + '): could not fetch ' + ('\'dfp-script\' source from \'' + response.config.url + '\'.')));
    }

    return DFPScriptError;
  }(Error);



  function dfpScriptDirective(scope, element, attributes, ad, $injector) {
    var $http = $injector.get('$http');
    var $log = $injector.get('$log');


    function addScript(contents) {
      var script = '(function(scope, ' + scope['slotAs'] + '){' + contents + '})';

      ad.addScript(eval(script).bind(null, scope['scope']));
    }

    if (scope['src']) {
      if (element.html()) {
        $log.warn('Ignoring inner HTML of dfp-script ' + 'in favor of src contents.');
      }

      $http.get(scope['src']).then(function (response) {
        addScript(response.data);
      }, function (response) {
        throw new DFPScriptError(response);
      });
    } else {
      addScript(element.html().trim());
    }

  }

  module.directive('dfpScript', ['$injector', function ($injector) {
    return {
      restrict: 'E',
      require: '^^dfpAd',
      scope: { 'slotAs': '@', 'scope': '=', 'src': '@' },
      link: function link() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        dfpScriptDirective.apply(null, args.slice(0, 4).concat($injector));
      }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function DFPSizeDirective(scope, element, attributes, parent, DFPMissingParentError) {
    parent = parent[1] || parent[0];

    if (!parent) {
      throw new DFPMissingParentError('dfp-size', 'dfp-ad', 'dfp-responsive');
    }

    if (scope.width && scope.height) {
      parent.addSize([scope.width, scope.height]);
    } else {
      parent.addSize(element[0].innerHTML);
    }
  }

  module.directive('dfpSize', ['DFPMissingParentError', function (DFPMissingParentError) {
    return {
      restrict: 'E',
      require: ['?^^dfpAd', '?^^dfpResponsive'],
      scope: { width: '=', height: '=' },
      link: function link() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        args = args.slice(0, 4).concat(DFPMissingParentError);
        DFPSizeDirective.apply(null, args);
      }
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpTargetingController(DFPIncompleteError) {
    var values = this.value ? [this.value] : [];

    this.checkValid = function () {
      if (this.key === undefined) {
        throw new DFPIncompleteError('dfp-targeting', 'key', true);
      }

      if (values.length === 0) {
        throw new DFPIncompleteError('dfp-targeting', 'value', true);
      }
    };

    this.getState = function () {
      this.checkValid();
      return Object.freeze({
        key: this.key,
        values: values
      });
    };

    this.addValue = function (value) {
      values.push(value);
    };
  }

  function dfpTargetingDirective(scope, element, attributes, ad) {
    console.assert(ad !== undefined);

    var targeting = scope.controller.getState();
    ad.addTargeting(targeting);
  }

  module.directive('dfpTargeting', [function () {
    return {
      restrict: 'E',
      require: '^^dfpAd', 
      controller: ['DFPIncompleteError', dfpTargetingController],
      controllerAs: 'controller',
      bindToController: true,
      scope: { key: '@', value: '@' },
      link: dfpTargetingDirective
    };
  }]);

})(angularDfp);


( function (module) {
  'use strict';


  function dfpValueDirective(scope, element, attributes, parent) {
    parent.addValue(element.html());
  }

  module.directive('dfpValue', [function () {
    return {
      restrict: 'E',
      require: '^^dfpTargeting',
      link: dfpValueDirective
    };
  }]);
})(angularDfp);


var angularDfpVideo = angular.module('angularDfp');

( function (module) {
  'use strict';


  var DFPVideoError = function (_Error7) {
    _inherits(DFPVideoError, _Error7);

    function DFPVideoError() {
      _classCallCheck(this, DFPVideoError);

      return _possibleConstructorReturn(this, (DFPVideoError.__proto__ || Object.getPrototypeOf(DFPVideoError)).apply(this, arguments));
    }

    return DFPVideoError;
  }(Error);



  function dfpVideoDirective(scope, element, attributes, $injector) {
    var dfpIDGenerator = $injector.get('dfpIDGenerator');

    element = element[0];

    if (element.tagName !== 'VIDEO') {
      throw new DFPVideoError("'dfp-video' directive must be attached to a <video> tag.");
    }

    dfpIDGenerator(element);

    var player = videojs(element.id);

    player.ima({ id: element.id, adTagUrl: scope['adTag'] });
    player.ima.requestAds();
    player.ima.initializeAdDisplayContainer();
  }

  module.directive('dfpVideo', ['$injector', function ($injector) {
    return {
      restrict: 'A',
      scope: { 'adTag': '@' },
      link: function link() {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        dfpVideoDirective.apply(null, args.slice(0, 3).concat($injector));
      }
    };
  }]);

  return module;

})(angularDfpVideo);


var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

( function (module) {
  'use strict';

  var DFPConfigurationError = function (_Error8) {
    _inherits(DFPConfigurationError, _Error8);

    function DFPConfigurationError() {
      _classCallCheck(this, DFPConfigurationError);

      return _possibleConstructorReturn(this, (DFPConfigurationError.__proto__ || Object.getPrototypeOf(DFPConfigurationError)).apply(this, arguments));
    }

    return DFPConfigurationError;
  }(Error);



  module.constant('GPT_LIBRARY_URL', '//www.googletagservices.com/tag/js/gpt.js');

  function dfpProvider(GPT_LIBRARY_URL) {
    var self = this;

    self.enableVideoAds = true;

    self.collapseIfEmpty = true;

    self.centering = false;

    self.location = null;

    self.ppid = null;

    self.globalTargeting = null;

    self.forceSafeFrame = false;

    self.safeFrameConfig = null;

    self.loadGPT = true;

    var loaded = false;

    function addSafeFrameConfig(pubads) {
      if (!self.safeFrameConfig) return;
      if (_typeof(self.globalTargeting) !== 'object') {
        throw new DFPConfigurationError('Targeting must be an object');
      }
      pubads.setSafeFrameConfig(self.safeFrameConfig);
    }

    function addTargeting(pubads) {
      if (!self.globalTargeting) return;
      if (_typeof(self.globalTargeting) !== 'object') {
        throw new DFPConfigurationError('Targeting must be an object');
      }

      for (var key in self.globalTargeting) {
        if (self.globalTargeting.hasOwnProperty(key)) {
          pubads.setTargeting(key, self.globalTargeting[key]);
        }
      }
    }

    function addLocation(pubads) {
      if (!self.location) return;

      if (typeof self.location === 'string') {
        pubads.setLocation(self.location);
        return;
      }

      if (!Array.isArray(self.location)) {
        throw new DFPConfigurationError('Location must be an ' + 'array or string');
      }

      pubads.setLocation.apply(pubads, self.location);
    }

    function addPPID(pubads) {
      if (!self.ppid) return;
      if (typeof self.ppid !== 'string') {
        throw new DFPConfigurationError('PPID must be a string');
      }

      pubads.setPublisherProvidedId(self.ppid);
    }

    this.$get = ['scriptInjector', function (scriptInjector) {
      function setup() {
        var pubads = googletag.pubads();

        if (self.enableVideoAds) {
          pubads.enableVideoAds();
        }

        if (self.collapseIfEmpty) {
          pubads.collapseEmptyDivs();
        }

        pubads.disableInitialLoad();
        pubads.setForceSafeFrame(self.forceSafeFrame);
        pubads.setCentering(self.centering);

        addLocation(pubads);
        addPPID(pubads);
        addTargeting(pubads);
        addSafeFrameConfig(pubads);

        googletag.enableServices();
      }

      function dfp() {
        googletag.cmd.push(setup);

        if (self.loadGPT) {
          scriptInjector(GPT_LIBRARY_URL).then(function () {
            loaded = true;
          });
        }
      }

      dfp.hasLoaded = function () {
        return loaded;
      };

      dfp.then = function (task) {
        googletag.cmd.push(task);
      };

      return dfp;
    }];
  }

  window.googletag = googletag;

  module.provider('dfp', ['GPT_LIBRARY_URL', dfpProvider]);

})(angularDfp);