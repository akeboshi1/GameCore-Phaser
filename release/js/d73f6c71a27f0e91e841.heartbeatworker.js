/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./node_modules/ts-loader/index.js!./src/net/heartbeatworker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/ts-loader/index.js!./src/net/heartbeatworker.ts":
/*!*************************************************************!*\
  !*** ./node_modules/ts-loader!./src/net/heartbeatworker.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var heartWorker = self;\r\nvar delayTime = 20000;\r\nvar reConnectCount = 0;\r\nvar startDelay;\r\nfunction startBeat() {\r\n    startDelay = setInterval(function () {\r\n        if (reConnectCount >= 8) {\r\n            postMessage({ \"method\": \"reConnect\" });\r\n            return;\r\n        }\r\n        reConnectCount++;\r\n        // Logger.getInstance().debug(\"heartBeat:\" + reConnectCount);\r\n        postMessage({ \"method\": \"heartBeat\" });\r\n    }, delayTime);\r\n}\r\nfunction endBeat() {\r\n    reConnectCount = 0;\r\n    if (startDelay) {\r\n        clearInterval(startDelay);\r\n    }\r\n    postMessage({ \"method\": \"endHeartBeat\" });\r\n}\r\nheartWorker.onmessage = function (ev) {\r\n    var data = ev.data;\r\n    switch (data.method) {\r\n        case \"startBeat\":\r\n            startBeat();\r\n            break;\r\n        case \"clearBeat\":\r\n            reConnectCount = 0;\r\n            // Logger.getInstance().debug(\"clearHeartBeat:\" + reConnectCount);\r\n            break;\r\n        case \"endBeat\":\r\n            endBeat();\r\n            break;\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack://TooqingCore/./src/net/heartbeatworker.ts?./node_modules/ts-loader");

/***/ })

/******/ });