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
/******/ 		"tooqing": 0
/******/ 	};
/******/
/******/
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "js/" + ({"vendors~game":"vendors~game","game":"game"}[chunkId]||chunkId) + "_v1.0.182.js"
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./launcher.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./launcher.ts":
/*!*********************!*\
  !*** ./launcher.ts ***!
  \*********************/
/*! exports provided: Launcher */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Launcher\", function() { return Launcher; });\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./version */ \"./version.js\");\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version__WEBPACK_IMPORTED_MODULE_0__);\n// 加载器：\r\n// 1. 在这里接受外部传入的参数并转换为World可以接受的参数\r\n// 2. 做设备兼容\r\n\r\nvar Launcher = /** @class */ (function () {\r\n    function Launcher(config) {\r\n        var _this = this;\r\n        this.minWidth = 1280;\r\n        this.minHeight = 720;\r\n        this.maxWidth = 1920;\r\n        this.maxHeight = 1080;\r\n        this.mConfig = {\r\n            auth_token: Object({\"debug\":true,\"api_root\":\"https://api-dev.tooqing.com/\",\"osd\":\"https://osd.tooqing.com/\",\"gateway\":Object({\"host\":\"115.182.75.99\",\"port\":22100,\"secure\":false}),\"game_id\":\"5e5dc4d80681ad5557b4d7a6\",\"virtual_world_id\":\"0\"}).auth_token,\r\n            token_expire: Object({\"debug\":true,\"api_root\":\"https://api-dev.tooqing.com/\",\"osd\":\"https://osd.tooqing.com/\",\"gateway\":Object({\"host\":\"115.182.75.99\",\"port\":22100,\"secure\":false}),\"game_id\":\"5e5dc4d80681ad5557b4d7a6\",\"virtual_world_id\":\"0\"}).token_expire,\r\n            token_fingerprint: Object({\"debug\":true,\"api_root\":\"https://api-dev.tooqing.com/\",\"osd\":\"https://osd.tooqing.com/\",\"gateway\":Object({\"host\":\"115.182.75.99\",\"port\":22100,\"secure\":false}),\"game_id\":\"5e5dc4d80681ad5557b4d7a6\",\"virtual_world_id\":\"0\"}).token_fingerprint,\r\n            server_addr: undefined,\r\n            game_id: \"5e5dc4d80681ad5557b4d7a6\",\r\n            virtual_world_id: \"0\",\r\n            // 16:9 = 3840×2160 2560X1440 1920×1080 1600×900 1366×768 1280×720 1024×576 960×540 854×480 720×405\r\n            width: this.minWidth,\r\n            height: this.minHeight,\r\n            screenWidth: this.minWidth,\r\n            screenHeight: this.minHeight,\r\n            baseWidth: this.maxWidth,\r\n            baseHeight: this.maxHeight,\r\n            ui_scale: 1,\r\n            closeGame: null,\r\n            platform: \"pc\",\r\n        };\r\n        if (config) {\r\n            Object.assign(this.mConfig, config);\r\n        }\r\n        this.intervalId = setInterval(function () {\r\n            var xhr = new XMLHttpRequest(); // TODO\r\n            xhr.open(\"GET\", \"./package.json\", true);\r\n            xhr.addEventListener(\"load\", function () {\r\n                var manifest = JSON.parse(xhr.response);\r\n                var newVersion = manifest.version;\r\n                if (_version__WEBPACK_IMPORTED_MODULE_0__[\"version\"] !== newVersion) {\r\n                    var result = confirm(\"检测到新版本，是否刷新更新到最新版？\");\r\n                    if (result && _this.mReload) {\r\n                        _this.mReload();\r\n                    }\r\n                }\r\n            });\r\n            xhr.send(null);\r\n        }, 4 * 60 * 60 * 1000 /* ms */);\r\n        Promise.all(/*! import() | game */[__webpack_require__.e(\"vendors~game\"), __webpack_require__.e(\"game\")]).then(__webpack_require__.bind(null, /*! ./src/game/world */ \"./src/game/world.ts\")).then(function (game) {\r\n            _this.world = new game.World(_this.config, _this.mCompleteFunc);\r\n            if (config.isEditor) {\r\n                _this.world.createGame();\r\n            }\r\n            _this.disableClick();\r\n        });\r\n    }\r\n    Object.defineProperty(Launcher.prototype, \"config\", {\r\n        get: function () {\r\n            return this.mConfig;\r\n        },\r\n        enumerable: true,\r\n        configurable: true\r\n    });\r\n    Launcher.start = function (config) {\r\n        return new this(config);\r\n    };\r\n    Launcher.prototype.enableClick = function () {\r\n        if (this.world)\r\n            this.world.enableClick();\r\n    };\r\n    Launcher.prototype.disableClick = function () {\r\n        if (this.world) {\r\n            this.world.disableClick();\r\n        }\r\n        else {\r\n        }\r\n    };\r\n    Launcher.prototype.startFullscreen = function () {\r\n        if (!this.world) {\r\n            return;\r\n        }\r\n        this.world.startFullscreen();\r\n    };\r\n    Launcher.prototype.stopFullscreen = function () {\r\n        if (!this.world) {\r\n            return;\r\n        }\r\n        this.world.stopFullscreen();\r\n    };\r\n    Launcher.prototype.setGameConfig = function (config) {\r\n        if (!this.world)\r\n            return;\r\n        this.world.setGameConfig(config);\r\n    };\r\n    Launcher.prototype.updatePalette = function (palette) {\r\n        if (!this.world)\r\n            return;\r\n        this.world.updatePalette(palette);\r\n    };\r\n    Launcher.prototype.updateMoss = function (moss) {\r\n        if (!this.world)\r\n            return;\r\n        this.world.updateMoss(moss);\r\n    };\r\n    Launcher.prototype.registerReload = function (func) {\r\n        this.mReload = func;\r\n    };\r\n    Launcher.prototype.registerComplete = function (func) {\r\n        this.mCompleteFunc = func;\r\n    };\r\n    Launcher.prototype.onResize = function (width, height, ui_scale) {\r\n        if (!this.world)\r\n            return;\r\n        if (ui_scale)\r\n            this.mConfig.ui_scale = ui_scale;\r\n        this.world.resize(width, height);\r\n        // if (width < height) {\r\n        //     this.world.resize(this.mConfig.screenHeight, this.mConfig.screenWidth);\r\n        // } else {\r\n        //     this.world.resize(this.mConfig.screenWidth, this.mConfig.screenHeight);\r\n        // }\r\n    };\r\n    Launcher.prototype.onOrientationChange = function (orientation, width, height) {\r\n        if (!this.world)\r\n            return;\r\n        this.world.onOrientationChange(orientation, width, height);\r\n    };\r\n    Launcher.prototype.destroy = function () {\r\n        if (this.intervalId)\r\n            clearInterval(this.intervalId);\r\n        if (this.world)\r\n            this.world.destroy();\r\n    };\r\n    return Launcher;\r\n}());\r\n\r\n\n\n//# sourceURL=webpack://TooqingCore/./launcher.ts?");

/***/ }),

/***/ "./version.js":
/*!********************!*\
  !*** ./version.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// generated by genversion\r\nmodule.exports = '1.0.182'\r\n\n\n//# sourceURL=webpack://TooqingCore/./version.js?");

/***/ })

/******/ });
});