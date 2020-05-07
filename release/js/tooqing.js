(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TooqingCore"] = factory();
	else
		root["TooqingCore"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 	};
/******/
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		1: 0
/******/ 	};
/******/
/******/
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "js/" + ({"0":"game","2":"vendors~game"}[chunkId]||chunkId) + "_v1.0.201.js"
/******/ 	}
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var script = document.createElement('script');
/******/ 				var onScriptComplete;
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 							error.name = 'ChunkLoadError';
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 120000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 				document.head.appendChild(script);
/******/ 			}
/******/ 		}
/******/ 		return Promise.all(promises);
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	var jsonpArray = this["webpackJsonpTooqingCore"] = this["webpackJsonpTooqingCore"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// generated by genversion
module.exports = '1.0.201'


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Launcher", function() { return Launcher; });
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version__WEBPACK_IMPORTED_MODULE_0__);
// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容

var Launcher = /** @class */ (function () {
    function Launcher(config) {
        var _this = this;
        this.minWidth = 1280;
        this.minHeight = 720;
        this.maxWidth = 1920;
        this.maxHeight = 1080;
        this.mConfig = {
            auth_token: Object({"debug":true,"api_root":"http://172.18.0.100:17170/","osd":"https://osd.tooqing.com/","gateway":Object({"host":"172.18.0.103","port":12100,"secure":false}),"game_id":"5e9a7dace87abc390c4b1b73","virtual_world_id":"65541"}).auth_token,
            token_expire: Object({"debug":true,"api_root":"http://172.18.0.100:17170/","osd":"https://osd.tooqing.com/","gateway":Object({"host":"172.18.0.103","port":12100,"secure":false}),"game_id":"5e9a7dace87abc390c4b1b73","virtual_world_id":"65541"}).token_expire,
            token_fingerprint: Object({"debug":true,"api_root":"http://172.18.0.100:17170/","osd":"https://osd.tooqing.com/","gateway":Object({"host":"172.18.0.103","port":12100,"secure":false}),"game_id":"5e9a7dace87abc390c4b1b73","virtual_world_id":"65541"}).token_fingerprint,
            server_addr: undefined,
            game_id: "5e9a7dace87abc390c4b1b73",
            virtual_world_id: "65541",
            // 16:9 = 3840×2160 2560X1440 1920×1080 1600×900 1366×768 1280×720 1024×576 960×540 854×480 720×405
            width: this.minWidth,
            height: this.minHeight,
            screenWidth: this.minWidth,
            screenHeight: this.minHeight,
            baseWidth: this.maxWidth,
            baseHeight: this.maxHeight,
            ui_scale: 1,
            closeGame: null,
            platform: "pc",
        };
        if (config) {
            Object.assign(this.mConfig, config);
        }
        this.intervalId = setInterval(function () {
            var xhr = new XMLHttpRequest(); // TODO
            xhr.open("GET", "./package.json", true);
            xhr.addEventListener("load", function () {
                var manifest = JSON.parse(xhr.response);
                var newVersion = manifest.version;
                if (_version__WEBPACK_IMPORTED_MODULE_0__["version"] !== newVersion) {
                    var result = confirm("检测到新版本，是否刷新更新到最新版？");
                    if (result && _this.mReload) {
                        _this.mReload();
                    }
                }
            });
            xhr.send(null);
        }, 4 * 60 * 60 * 1000 /* ms */);
        Promise.all(/* import() | game */[__webpack_require__.e(2), __webpack_require__.e(0)]).then(__webpack_require__.bind(null, 2)).then(function (game) {
            _this.world = new game.World(_this.config, _this.mCompleteFunc);
            if (config.isEditor) {
                _this.world.createGame();
            }
            _this.disableClick();
        });
    }
    Object.defineProperty(Launcher.prototype, "config", {
        get: function () {
            return this.mConfig;
        },
        enumerable: true,
        configurable: true
    });
    Launcher.start = function (config) {
        return new this(config);
    };
    Launcher.prototype.enableClick = function () {
        if (this.world)
            this.world.enableClick();
    };
    Launcher.prototype.disableClick = function () {
        if (this.world) {
            this.world.disableClick();
        }
        else {
        }
    };
    Launcher.prototype.startFullscreen = function () {
        if (!this.world) {
            return;
        }
        this.world.startFullscreen();
    };
    Launcher.prototype.stopFullscreen = function () {
        if (!this.world) {
            return;
        }
        this.world.stopFullscreen();
    };
    Launcher.prototype.setGameConfig = function (config) {
        if (!this.world)
            return;
        this.world.setGameConfig(config);
    };
    Launcher.prototype.updatePalette = function (palette) {
        if (!this.world)
            return;
        this.world.updatePalette(palette);
    };
    Launcher.prototype.updateMoss = function (moss) {
        if (!this.world)
            return;
        this.world.updateMoss(moss);
    };
    Launcher.prototype.registerReload = function (func) {
        this.mReload = func;
    };
    Launcher.prototype.registerComplete = function (func) {
        this.mCompleteFunc = func;
    };
    Launcher.prototype.onResize = function (width, height, ui_scale) {
        if (!this.world)
            return;
        if (ui_scale)
            this.mConfig.ui_scale = ui_scale;
        this.world.resize(width, height);
        // if (width < height) {
        //     this.world.resize(this.mConfig.screenHeight, this.mConfig.screenWidth);
        // } else {
        //     this.world.resize(this.mConfig.screenWidth, this.mConfig.screenHeight);
        // }
    };
    Launcher.prototype.onOrientationChange = function (orientation, width, height) {
        if (!this.world)
            return;
        this.world.onOrientationChange(orientation, width, height);
    };
    Launcher.prototype.destroy = function () {
        if (this.intervalId)
            clearInterval(this.intervalId);
        if (this.world)
            this.world.destroy();
    };
    return Launcher;
}());



/***/ })
/******/ ]);
});