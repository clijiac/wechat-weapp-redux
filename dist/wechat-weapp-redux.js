(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["WeAppRedux"] = factory();
	else
		root["WeAppRedux"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _Provider = __webpack_require__(1);

	var _Provider2 = _interopRequireDefault(_Provider);

	var _connect = __webpack_require__(2);

	var _connect2 = _interopRequireDefault(_connect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	  Provider: _Provider2.default,
	  connect: _connect2.default
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _warning = __webpack_require__(5);

	var _warning2 = _interopRequireDefault(_warning);

	var _Object = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function checkStoreShape(store) {
	  var missingMethods = ['subscribe', 'dispatch', 'getState'].filter(function (m) {
	    return !store.hasOwnProperty(m);
	  });

	  if (missingMethods.length > 0) {
	    (0, _warning2.default)('Store似乎不是一个合法的Redux Store对象: ' + '缺少这些方法: ' + missingMethods.join(', ') + '。');
	  }
	}

	function Provider(store) {
	  checkStoreShape(store);
	  return function (appConfig) {
	    return (0, _Object.assign)({}, appConfig, { store: store });
	  };
	}

	module.exports = Provider;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // import shallowEqual from "./shallowEqual.js";
	// import warning from "./warning.js";
	// import wrapActionCreators from "./wrapActionCreators.js";
	// import { assign } from "./utils/Object.js";


	var _util = __webpack_require__(4);

	var defaultMapStateToProps = function defaultMapStateToProps(state) {
	    return {};
	}; // eslint-disable-line no-unused-vars
	var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
	    return { dispatch: dispatch };
	};

	var listeners = [];
	var subscription = null;

	var createListener = function createListener(context, store, mapState) {
	    var initOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	    var prevState = void 0,
	        tmp = void 0;
	    var listener = function listener(state) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        var nextState = mapState.apply(undefined, [state, initOptions].concat(args));
	        if (!prevState || !(0, _util.deepEqual)(nextState, prevState)) {
	            tmp = (0, _util.clone)(nextState);
	            context.onStateChange.call(context, (0, _util.clone)(prevState) || {}, nextState);
	            prevState = tmp;
	        }
	    };

	    listener(store.getState()); // to sync init state
	    listener.isActive = true;
	    return listener;
	};

	var defaultMergeConfig = function defaultMergeConfig(config, overrides) {
	    return _extends({}, config, overrides);
	};

	var setupSubscription = function setupSubscription(store) {
	    if ((0, _util.isFn)(subscription)) {
	        return subscription;
	    }
	    var callback = function callback() {
	        listeners.filter(function (fn) {
	            return fn.isActive;
	        }).forEach(function (fn) {
	            return fn(store.getState());
	        });
	    };
	    return subscription = store.subscribe(callback);
	};

	var injectChangeListenerStatus = function injectChangeListenerStatus(store, handler, listener, isActive) {
	    return function () {
	        if (listener) {
	            var prev = listener.isActive;
	            listener.isActive = isActive;
	            if (!prev && isActive) {
	                listener.apply(undefined, [store.getState()].concat(Array.prototype.slice.call(arguments)));
	            }
	        }
	        return (0, _util.callInContext)(handler, this, arguments);
	    };
	};

	var injectOnStateChange = function injectOnStateChange(handler) {
	    return function () {
	        return (0, _util.callInContext)(handler, this, arguments);
	    };
	};

	var connect = function connect(store, mapState, mapDispatch) {
	    var resolveMapDispatch = function resolveMapDispatch() {
	        return (0, _util.isFn)(mapDispatch) ? mapDispatch(store.dispatch) : {};
	    };

	    return function (injectLifeCycle, config) {
	        var mergedConfig = defaultMergeConfig(config, resolveMapDispatch());
	        if (!(0, _util.isFn)(mapState)) {
	            return mergedConfig;
	        }

	        setupSubscription(store);
	        return _extends({}, mergedConfig, injectLifeCycle(mergedConfig, mapState));
	    };
	};

	var connectApp = function connectApp(store, mapState, mapDispatch) {
	    var factory = connect(store, mapState, mapDispatch);

	    var injectAppLifeCycle = function injectAppLifeCycle(config) {
	        var _onLaunch = config.onLaunch,
	            onShow = config.onShow,
	            onHide = config.onHide,
	            onStateChange = config.onStateChange;


	        return {
	            onLaunch: function onLaunch(options) {
	                var listener = createListener(this, store, mapState, options);
	                listener.index = listeners.push(listener) - 1;

	                this.onShow = injectChangeListenerStatus(store, onShow, listener, true);
	                this.onHide = injectChangeListenerStatus(store, onHide, listener, false);
	                return (0, _util.callInContext)(_onLaunch, this, arguments);
	            },
	            onShow: (0, _util.isFn)(onShow) ? onShow : _util.noop,
	            onHide: (0, _util.isFn)(onHide) ? onHide : _util.noop,
	            onStateChange: injectOnStateChange(onStateChange)
	        };
	    };

	    return function (config) {
	        return factory(injectAppLifeCycle, config);
	    };
	};

	var connectPage = function connectPage(mapState, mapDispatch) {
	    var app = getApp();
	    var store = app.store;
	    var factory = connect(store, mapState, mapDispatch);

	    var injectPageLifeCycle = function injectPageLifeCycle(config) {
	        var _onLoad = config.onLoad,
	            onUnload = config.onUnload,
	            onShow = config.onShow,
	            onHide = config.onHide,
	            onStateChange = config.onStateChange;


	        return {
	            onLoad: function onLoad(options) {
	                var listener = createListener(this, store, mapState, options);
	                listener.index = listeners.push(listener) - 1;

	                this.onUnload = function () {
	                    listeners.splice(listener.index, 1);
	                    return (0, _util.callInContext)(onUnload, this, arguments);
	                };

	                this.onShow = injectChangeListenerStatus(store, onShow, listener, true);
	                this.onHide = injectChangeListenerStatus(store, onHide, listener, false);
	                return (0, _util.callInContext)(_onLoad, this, arguments);
	            },

	            onUnload: (0, _util.isFn)(onUnload) ? onUnload : _util.noop,
	            onShow: (0, _util.isFn)(onShow) ? onShow : _util.noop,
	            onHide: (0, _util.isFn)(onHide) ? onHide : _util.noop,
	            onStateChange: injectOnStateChange(onStateChange)
	        };
	    };

	    return function (config) {
	        return factory(injectPageLifeCycle, config);
	    };
	};

	// function connect(mapStateToProps, mapDispatchToProps) {
	//     const shouldSubscribe = Boolean(mapStateToProps);
	//     const mapState = mapStateToProps || defaultMapStateToProps;
	//     const app = getApp();
	//     let prevMappedState = {};//we chat will inject some prop in page.data, so we store the prev mapped state since we only focus on the mapped state
	//     let mapDispatch;
	//     if (typeof mapDispatchToProps === "function") {
	//         mapDispatch = mapDispatchToProps;
	//     } else if (!mapDispatchToProps) {
	//         mapDispatch = defaultMapDispatchToProps;
	//     } else {
	//         mapDispatch = wrapActionCreators(mapDispatchToProps);
	//     }
	//
	//     return function wrapWithConnect(pageConfig) {
	//         const { onLoad: _onLoad, onUnload: _onUnload, onStateChange: _onStateChange } = pageConfig;
	//
	//         function handleChange(options) {
	//             if (!this.unsubscribe) {
	//                 return;
	//             }
	//
	//             const state = this.store.getState();
	//             const mappedState = mapState(state, options);
	//             if (shallowEqual(prevMappedState, mappedState)) {
	//                 return;
	//             }
	//             let callback = null;
	//             if (typeof _onStateChange === "function") {
	//                 callback = () => _onStateChange.call(this,prevMappedState, mappedState);
	//             }
	//             this.setData(mappedState, callback);
	//             prevMappedState = mappedState;// save mapped state
	//         }
	//
	//         function onLoad(options) {
	//             this.store = app.store;
	//             if (!this.store) {
	//                 warning("Store对象不存在!");
	//             }
	//             if (shouldSubscribe) {
	//                 this.unsubscribe = this.store.subscribe(handleChange.bind(this, options));
	//                 handleChange.call(this, options);
	//             }
	//             if (typeof _onLoad === "function") {
	//                 _onLoad.call(this, options);
	//             }
	//         }
	//
	//         function onUnload() {
	//             if (typeof _onUnload === "function") {
	//                 _onUnload.call(this);
	//             }
	//             typeof this.unsubscribe === "function" && this.unsubscribe();
	//         }
	//
	//         return assign({}, pageConfig, mapDispatch(app.store.dispatch), { onLoad, onUnload });
	//     };
	// }

	module.exports = connectPage;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	var assign = function assign(target) {
	    'use strict';
	    // We must check against these specific cases.

	    if (target === undefined || target === null) {
	        throw new TypeError('Cannot convert undefined or null to object');
	    }

	    var output = Object(target);
	    for (var index = 1; index < arguments.length; index++) {
	        var source = arguments[index];
	        if (source !== undefined && source !== null) {
	            for (var nextKey in source) {
	                if (source.hasOwnProperty(nextKey)) {
	                    output[nextKey] = source[nextKey];
	                }
	            }
	        }
	    }
	    return output;
	};

	module.exports = {
	    assign: assign
	};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	 * Copy From https://github.com/xixilive/redux-weapp/blob/master/es6/utils.js
	 */
	var proto = Object.prototype;
	var hasOwnProp = proto.hasOwnProperty;

	var noop = function noop() {};

	var isFn = function isFn(fn) {
	    return 'function' === typeof fn;
	};

	var typeOf = function typeOf(v) {
	    var t = proto.toString.call(v); // [object XXX]
	    return t.substr(8, t.length - 9);
	};

	var deepEqual = function deepEqual(a, b) {
	    if (a === b) {
	        return true;
	    }

	    if (a && b && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) == 'object' && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) == 'object') {
	        var arrA = typeOf(a) === 'Array',
	            arrB = typeOf(b) === 'Array';
	        if (arrA !== arrB) {
	            return false;
	        }

	        var i = void 0;
	        if (arrA && arrB) {
	            if (a.length !== b.length) {
	                return false;
	            }

	            i = a.length;
	            while (i--) {
	                if (!deepEqual(a[i], b[i])) {
	                    return false;
	                }
	            }
	            return true;
	        }

	        var dateA = a instanceof Date,
	            dateB = b instanceof Date;
	        if (dateA !== dateB) {
	            return false;
	        }

	        if (dateA && dateB) {
	            return a.getTime() === b.getTime();
	        }

	        var regexpA = a instanceof RegExp,
	            regexpB = b instanceof RegExp;
	        if (regexpA !== regexpB) {
	            return false;
	        }
	        if (regexpA && regexpB) {
	            return a.toString() === b.toString();
	        }

	        var keys = Object.keys(a);
	        i = keys.length;
	        if (i !== Object.keys(b).length) {
	            return false;
	        }

	        // check own props
	        while (i--) {
	            if (!hasOwnProp.call(b, keys[i])) {
	                return false;
	            }
	        }

	        i = keys.length;
	        while (i--) {
	            if (!deepEqual(a[keys[i]], b[keys[i]])) {
	                return false;
	            }
	        }

	        return true;
	    }

	    return a !== a && b !== b;
	};

	// Clone JSON serializable object recursive
	// Because a store state should/must be JSON serializable
	var clonable = function clonable(target) {
	    switch (typeOf(target)) {
	        case 'Object':
	        case 'Array':
	        case 'Date':
	            return true;
	        default:
	            return false;
	    }
	};

	var clone = function clone(target) {
	    if (Object(target) !== target) {
	        //primitives
	        return target;
	    }

	    if (!clonable(target)) {
	        return;
	    }

	    if (target instanceof Array) {
	        var newArr = [];
	        for (var i = 0, len = target.length; i < len; i++) {
	            newArr[i] = clone(target[i]);
	        }
	        return newArr;
	    }

	    if (target instanceof Date) {
	        return new Date(target.getTime());
	    }

	    var result = {};
	    for (var k in target) {
	        result[k] = clone(target[k]);
	    }
	    return result;
	};

	var callInContext = function callInContext(fn, context) {
	    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        args[_key - 2] = arguments[_key];
	    }

	    if (!isFn(fn)) return;
	    if (Object.prototype.toString.call(args[0]) === '[object Arguments]') {
	        return fn.call.apply(fn, [context].concat(_toConsumableArray([].slice.call(args[0]))));
	    }
	    return fn.call.apply(fn, [context].concat(args));
	};

	exports.isFn = isFn;
	exports.noop = noop;
	exports.deepEqual = deepEqual;
	exports.clone = clone;
	exports.callInContext = callInContext;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

	module.exports = warning;

/***/ })
/******/ ])
});
;