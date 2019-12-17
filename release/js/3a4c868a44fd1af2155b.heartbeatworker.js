/*! For license information please see 3a4c868a44fd1af2155b.heartbeatworker.js.LICENSE */
!function(r){var e={};function __webpack_require__(n){if(e[n])return e[n].exports;var a=e[n]={i:n,l:!1,exports:{}};return r[n].call(a.exports,a,a.exports,__webpack_require__),a.l=!0,a.exports}__webpack_require__.m=r,__webpack_require__.c=e,__webpack_require__.d=function(r,e,n){__webpack_require__.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:n})},__webpack_require__.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},__webpack_require__.t=function(r,e){if(1&e&&(r=__webpack_require__(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var n=Object.create(null);if(__webpack_require__.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var a in r)__webpack_require__.d(n,a,function(e){return r[e]}.bind(null,a));return n},__webpack_require__.n=function(r){var e=r&&r.__esModule?function getDefault(){return r.default}:function getModuleExports(){return r};return __webpack_require__.d(e,"a",e),e},__webpack_require__.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s="./node_modules/ts-loader/index.js!./src/net/heartbeatworker.ts")}({"./node_modules/ts-loader/index.js!./src/net/heartbeatworker.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval('__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/log */ "./src/utils/log.ts");\n\r\nvar heartWorker = self;\r\nvar delayTime = 10000;\r\nvar reConnectCount = 0;\r\nvar startDelay;\r\nfunction startBeat() {\r\n    startDelay = setInterval(function () {\r\n        if (reConnectCount >= 5) {\r\n            postMessage({ "method": "reConnect" });\r\n            return;\r\n        }\r\n        reConnectCount++;\r\n        _utils_log__WEBPACK_IMPORTED_MODULE_0__["Logger"].getInstance().debug("heartBeat:" + reConnectCount);\r\n        postMessage({ "method": "heartBeat" });\r\n    }, delayTime);\r\n}\r\nfunction endBeat() {\r\n    reConnectCount = 0;\r\n    if (startDelay) {\r\n        clearInterval(startDelay);\r\n    }\r\n    postMessage({ "method": "endHeartBeat" });\r\n}\r\nheartWorker.onmessage = function (ev) {\r\n    var data = ev.data;\r\n    switch (data.method) {\r\n        case "startBeat":\r\n            startBeat();\r\n            break;\r\n        case "clearBeat":\r\n            reConnectCount = 0;\r\n            _utils_log__WEBPACK_IMPORTED_MODULE_0__["Logger"].getInstance().debug("clearHeartBeat:" + reConnectCount);\r\n            break;\r\n        case "endBeat":\r\n            endBeat();\r\n            break;\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack://TooqingCore/./src/net/heartbeatworker.ts?./node_modules/ts-loader')},"./src/utils/log.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval('__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Logger", function() { return Logger; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "log", function() { return log; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "error", function() { return error; });\nvar __spreadArrays = (undefined && undefined.__spreadArrays) || function () {\r\n    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;\r\n    for (var r = Array(s), k = 0, i = 0; i < il; i++)\r\n        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)\r\n            r[k] = a[j];\r\n    return r;\r\n};\r\n/* tslint:disable */\r\nvar Logger = /** @class */ (function () {\r\n    function Logger() {\r\n        this.mErrorList = [];\r\n        this.mWarnList = [];\r\n    }\r\n    Logger.getInstance = function () {\r\n        if (!Logger._instance)\r\n            Logger._instance = new Logger();\r\n        return Logger._instance;\r\n    };\r\n    Logger.prototype.log = function (message) {\r\n        var optionalParams = [];\r\n        for (var _i = 1; _i < arguments.length; _i++) {\r\n            optionalParams[_i - 1] = arguments[_i];\r\n        }\r\n        console.log.apply(console, __spreadArrays([message], optionalParams));\r\n    };\r\n    Logger.prototype.error = function (message) {\r\n        var optionalParams = [];\r\n        for (var _i = 1; _i < arguments.length; _i++) {\r\n            optionalParams[_i - 1] = arguments[_i];\r\n        }\r\n        console.error.apply(console, __spreadArrays([message], optionalParams));\r\n        this.mErrorList.push(message);\r\n    };\r\n    Logger.prototype.warn = function (message) {\r\n        var optionalParams = [];\r\n        for (var _i = 1; _i < arguments.length; _i++) {\r\n            optionalParams[_i - 1] = arguments[_i];\r\n        }\r\n        console.warn.apply(console, __spreadArrays([message], optionalParams));\r\n        this.mWarnList.push(message);\r\n    };\r\n    Logger.prototype.debug = function (message) {\r\n        var optionalParams = [];\r\n        for (var _i = 1; _i < arguments.length; _i++) {\r\n            optionalParams[_i - 1] = arguments[_i];\r\n        }\r\n        console.log.apply(console, __spreadArrays([message], optionalParams));\r\n    };\r\n    Logger.prototype.info = function (message) {\r\n        var optionalParams = [];\r\n        for (var _i = 1; _i < arguments.length; _i++) {\r\n            optionalParams[_i - 1] = arguments[_i];\r\n        }\r\n        console.info.apply(console, __spreadArrays([message], optionalParams));\r\n    };\r\n    Logger.prototype.getErrorList = function () {\r\n        return this.mErrorList;\r\n    };\r\n    Logger.prototype.getWarnList = function () {\r\n        return this.mWarnList;\r\n    };\r\n    return Logger;\r\n}());\r\n\r\nfunction log(message) {\r\n    var optionalParams = [];\r\n    for (var _i = 1; _i < arguments.length; _i++) {\r\n        optionalParams[_i - 1] = arguments[_i];\r\n    }\r\n    console.log.apply(console, __spreadArrays([message], optionalParams));\r\n}\r\nfunction error(message) {\r\n    var optionalParams = [];\r\n    for (var _i = 1; _i < arguments.length; _i++) {\r\n        optionalParams[_i - 1] = arguments[_i];\r\n    }\r\n    console.error.apply(console, __spreadArrays([message], optionalParams));\r\n}\r\n\n\n//# sourceURL=webpack://TooqingCore/./src/utils/log.ts?')}});