!function webpackUniversalModuleDefinition(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.TooqingCore=t():e.TooqingCore=t()}(this,(function(){return function(e){function webpackJsonpCallback(t){for(var o,n,i=t[0],a=t[1],u=0,s=[];u<i.length;u++)n=i[u],r[n]&&s.push(r[n][0]),r[n]=0;for(o in a)Object.prototype.hasOwnProperty.call(a,o)&&(e[o]=a[o]);for(c&&c(t);s.length;)s.shift()()}var t={},r={1:0};function __webpack_require__(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,__webpack_require__),o.l=!0,o.exports}__webpack_require__.e=function requireEnsure(e){var t=[],o=r[e];if(0!==o)if(o)t.push(o[2]);else{var n=new Promise((function(t,n){o=r[e]=[t,n]}));t.push(o[2]=n);var i,c=document.createElement("script");c.charset="utf-8",c.timeout=120,__webpack_require__.nc&&c.setAttribute("nonce",__webpack_require__.nc),c.src=function jsonpScriptSrc(e){return __webpack_require__.p+"js/"+({0:"game",2:"vendors~game"}[e]||e)+"_v1.0.94.js"}(e);var a=new Error;i=function(t){c.onerror=c.onload=null,clearTimeout(u);var o=r[e];if(0!==o){if(o){var n=t&&("load"===t.type?"missing":t.type),i=t&&t.target&&t.target.src;a.message="Loading chunk "+e+" failed.\n("+n+": "+i+")",a.name="ChunkLoadError",a.type=n,a.request=i,o[1](a)}r[e]=void 0}};var u=setTimeout((function(){i({type:"timeout",target:c})}),12e4);c.onerror=c.onload=i,document.head.appendChild(c)}return Promise.all(t)},__webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.d=function(e,t,r){__webpack_require__.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},__webpack_require__.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},__webpack_require__.t=function(e,t){if(1&t&&(e=__webpack_require__(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(__webpack_require__.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)__webpack_require__.d(r,o,function(t){return e[t]}.bind(null,o));return r},__webpack_require__.n=function(e){var t=e&&e.__esModule?function getDefault(){return e.default}:function getModuleExports(){return e};return __webpack_require__.d(t,"a",t),t},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},__webpack_require__.p="",__webpack_require__.oe=function(e){throw console.error(e),e};var o=this.webpackJsonpTooqingCore=this.webpackJsonpTooqingCore||[],n=o.push.bind(o);o.push=webpackJsonpCallback,o=o.slice();for(var i=0;i<o.length;i++)webpackJsonpCallback(o[i]);var c=n;return __webpack_require__(__webpack_require__.s=2)}([function(e,t,r){"use strict";r.d(t,"a",(function(){return o}));var o=function(){function Logger(){this.mErrorList=[],this.mWarnList=[]}return Logger.getInstance=function(){return Logger._instance||(Logger._instance=new Logger),Logger._instance},Logger.prototype.log=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];console.log.apply(console,[e].concat(t))},Logger.prototype.error=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];console.error.apply(console,[e].concat(t)),this.mErrorList.push(e)},Logger.prototype.warn=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];console.warn.apply(console,[e].concat(t)),this.mWarnList.push(e)},Logger.prototype.debug=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];console.log.apply(console,[e].concat(t))},Logger.prototype.info=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];console.info.apply(console,[e].concat(t))},Logger.prototype.getErrorList=function(){return this.mErrorList},Logger.prototype.getWarnList=function(){return this.mWarnList},Logger}()},function(e,t){e.exports="1.0.94"},function(e,t,r){"use strict";r.r(t),r.d(t,"Launcher",(function(){return i}));var o=r(1),n=r(0),i=function(){function Launcher(e){var t=this;this.minWidth=1280,this.minHeight=720,this.maxWidth=1920,this.maxHeight=1080,this.mConfig={auth_token:Object({api_root:"http://172.18.0.100:17170/",osd:"https://osd-dev.tooqing.com/",gateway:Object({host:"172.18.0.100",port:12100,secure:!1}),game_id:"5e1e9dfc3380501ec65116fe",virtual_world_id:"0"}).auth_token,token_expire:Object({api_root:"http://172.18.0.100:17170/",osd:"https://osd-dev.tooqing.com/",gateway:Object({host:"172.18.0.100",port:12100,secure:!1}),game_id:"5e1e9dfc3380501ec65116fe",virtual_world_id:"0"}).token_expire,token_fingerprint:Object({api_root:"http://172.18.0.100:17170/",osd:"https://osd-dev.tooqing.com/",gateway:Object({host:"172.18.0.100",port:12100,secure:!1}),game_id:"5e1e9dfc3380501ec65116fe",virtual_world_id:"0"}).token_fingerprint,server_addr:void 0,game_id:"5e1e9dfc3380501ec65116fe",virtual_world_id:"0",width:this.minWidth,height:this.minHeight,baseWidth:this.maxWidth,baseHeight:this.maxHeight,ui_scale:1,closeGame:null,platform:"pc"},e&&Object.assign(this.mConfig,e),this.intervalId=setInterval((function(){var e=new XMLHttpRequest;e.open("GET","./package.json",!0),e.addEventListener("load",(function(){var r=JSON.parse(e.response).version;o.version!==r&&(confirm("检测到新版本，是否刷新更新到最新版？")&&t.mReload&&t.mReload())})),e.send(null)}),144e5),Promise.all([r.e(2),r.e(0)]).then(r.bind(null,3)).then((function(e){t.world=new e.World(t.config,t.mCompleteFunc),t.disableClick()}))}return Object.defineProperty(Launcher.prototype,"config",{get:function(){return this.mConfig},enumerable:!0,configurable:!0}),Launcher.start=function(e){return new this(e)},Launcher.prototype.enableClick=function(){this.world&&this.world.enableClick()},Launcher.prototype.disableClick=function(){this.world?(n.a.getInstance().log("launcher disable"),this.world.disableClick()):n.a.getInstance().log("no world")},Launcher.prototype.startFullscreen=function(){this.world&&this.world.startFullscreen()},Launcher.prototype.stopFullscreen=function(){this.world&&this.world.stopFullscreen()},Launcher.prototype.registerReload=function(e){this.mReload=e},Launcher.prototype.registerComplete=function(e){this.mCompleteFunc=e},Launcher.prototype.onResize=function(e,t,r){this.world&&(r&&(this.mConfig.ui_scale=r),this.world.resize(e,t))},Launcher.prototype.destroy=function(){this.intervalId&&clearInterval(this.intervalId),this.world&&this.world.destroy()},Launcher}()}])}));