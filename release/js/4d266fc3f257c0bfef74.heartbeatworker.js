!function(e){var r={};function __webpack_require__(t){if(r[t])return r[t].exports;var o=r[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,__webpack_require__),o.l=!0,o.exports}__webpack_require__.m=e,__webpack_require__.c=r,__webpack_require__.d=function(e,r,t){__webpack_require__.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},__webpack_require__.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},__webpack_require__.t=function(e,r){if(1&r&&(e=__webpack_require__(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(__webpack_require__.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)__webpack_require__.d(t,o,function(r){return e[r]}.bind(null,o));return t},__webpack_require__.n=function(e){var r=e&&e.__esModule?function getDefault(){return e.default}:function getModuleExports(){return e};return __webpack_require__.d(r,"a",r),r},__webpack_require__.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=0)}([function(e,r,t){"use strict";t.r(r);var __spreadArrays=function(){for(var e=0,r=0,t=arguments.length;r<t;r++)e+=arguments[r].length;var o=Array(e),n=0;for(r=0;r<t;r++)for(var a=arguments[r],_=0,u=a.length;_<u;_++,n++)o[n]=a[_];return o},o=function(){function Logger(){this.mErrorList=[],this.mWarnList=[]}return Logger.getInstance=function(){return Logger._instance||(Logger._instance=new Logger),Logger._instance},Logger.prototype.log=function(e){for(var r=[],t=1;t<arguments.length;t++)r[t-1]=arguments[t];console.log.apply(console,__spreadArrays([e],r))},Logger.prototype.error=function(e){for(var r=[],t=1;t<arguments.length;t++)r[t-1]=arguments[t];console.error.apply(console,__spreadArrays([e],r)),this.mErrorList.push(e)},Logger.prototype.warn=function(e){for(var r=[],t=1;t<arguments.length;t++)r[t-1]=arguments[t];console.warn.apply(console,__spreadArrays([e],r)),this.mWarnList.push(e)},Logger.prototype.debug=function(e){for(var r=[],t=1;t<arguments.length;t++)r[t-1]=arguments[t];console.log.apply(console,__spreadArrays([e],r))},Logger.prototype.info=function(e){for(var r=[],t=1;t<arguments.length;t++)r[t-1]=arguments[t];console.info.apply(console,__spreadArrays([e],r))},Logger.prototype.getErrorList=function(){return this.mErrorList},Logger.prototype.getWarnList=function(){return this.mWarnList},Logger}();var n,a=self,_=1e4,u=0;a.onmessage=function(e){switch(e.data.method){case"startBeat":!function startBeat(){n=setInterval((function(){u>=5?postMessage({method:"reConnect"}):(u++,o.getInstance().debug("heartBeat:"+u),postMessage({method:"heartBeat"}))}),_)}();break;case"clearBeat":u=0,o.getInstance().debug("clearHeartBeat:"+u);break;case"endBeat":!function endBeat(){u=0,n&&clearInterval(n),postMessage({method:"endHeartBeat"})}()}}}]);