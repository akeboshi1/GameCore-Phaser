!function webpackUniversalModuleDefinition(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.TooqingCore=t():e.TooqingCore=t()}(this,(function(){return function(e){function webpackJsonpCallback(t){for(var o,n,i=t[0],c=t[1],u=0,s=[];u<i.length;u++)n=i[u],Object.prototype.hasOwnProperty.call(r,n)&&r[n]&&s.push(r[n][0]),r[n]=0;for(o in c)Object.prototype.hasOwnProperty.call(c,o)&&(e[o]=c[o]);for(a&&a(t);s.length;)s.shift()()}var t={},r={1:0};function __webpack_require__(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,__webpack_require__),o.l=!0,o.exports}__webpack_require__.e=function requireEnsure(e){var t=[],o=r[e];if(0!==o)if(o)t.push(o[2]);else{var n=new Promise((function(t,n){o=r[e]=[t,n]}));t.push(o[2]=n);var i,a=document.createElement("script");a.charset="utf-8",a.timeout=120,__webpack_require__.nc&&a.setAttribute("nonce",__webpack_require__.nc),a.src=function jsonpScriptSrc(e){return __webpack_require__.p+"js/"+({0:"game",2:"vendors~game"}[e]||e)+"_v1.0.188.js"}(e);var c=new Error;i=function(t){a.onerror=a.onload=null,clearTimeout(u);var o=r[e];if(0!==o){if(o){var n=t&&("load"===t.type?"missing":t.type),i=t&&t.target&&t.target.src;c.message="Loading chunk "+e+" failed.\n("+n+": "+i+")",c.name="ChunkLoadError",c.type=n,c.request=i,o[1](c)}r[e]=void 0}};var u=setTimeout((function(){i({type:"timeout",target:a})}),12e4);a.onerror=a.onload=i,document.head.appendChild(a)}return Promise.all(t)},__webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.d=function(e,t,r){__webpack_require__.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},__webpack_require__.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},__webpack_require__.t=function(e,t){if(1&t&&(e=__webpack_require__(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(__webpack_require__.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)__webpack_require__.d(r,o,function(t){return e[t]}.bind(null,o));return r},__webpack_require__.n=function(e){var t=e&&e.__esModule?function getDefault(){return e.default}:function getModuleExports(){return e};return __webpack_require__.d(t,"a",t),t},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},__webpack_require__.p="",__webpack_require__.oe=function(e){throw console.error(e),e};var o=this.webpackJsonpTooqingCore=this.webpackJsonpTooqingCore||[],n=o.push.bind(o);o.push=webpackJsonpCallback,o=o.slice();for(var i=0;i<o.length;i++)webpackJsonpCallback(o[i]);var a=n;return __webpack_require__(__webpack_require__.s=1)}([function(e,t){e.exports="1.0.188"},function(e,t,r){"use strict";r.r(t),r.d(t,"Launcher",(function(){return n}));var o=r(0),n=function(){function Launcher(e){var t=this;this.minWidth=1280,this.minHeight=720,this.maxWidth=1920,this.maxHeight=1080,this.mConfig={auth_token:Object({debug:!0,api_root:"https://api-dev.tooqing.com/",osd:"https://osd.tooqing.com/",gateway:Object({host:"gdev.tooqing.com",port:11100,secure:!0}),game_id:"5cd8cf04cbcbf91a0afc3f96.5e410ba50681ad5557b4d6e9",virtual_world_id:"0"}).auth_token,token_expire:Object({debug:!0,api_root:"https://api-dev.tooqing.com/",osd:"https://osd.tooqing.com/",gateway:Object({host:"gdev.tooqing.com",port:11100,secure:!0}),game_id:"5cd8cf04cbcbf91a0afc3f96.5e410ba50681ad5557b4d6e9",virtual_world_id:"0"}).token_expire,token_fingerprint:Object({debug:!0,api_root:"https://api-dev.tooqing.com/",osd:"https://osd.tooqing.com/",gateway:Object({host:"gdev.tooqing.com",port:11100,secure:!0}),game_id:"5cd8cf04cbcbf91a0afc3f96.5e410ba50681ad5557b4d6e9",virtual_world_id:"0"}).token_fingerprint,server_addr:void 0,game_id:"5cd8cf04cbcbf91a0afc3f96.5e410ba50681ad5557b4d6e9",virtual_world_id:"0",width:this.minWidth,height:this.minHeight,screenWidth:this.minWidth,screenHeight:this.minHeight,baseWidth:this.maxWidth,baseHeight:this.maxHeight,ui_scale:1,closeGame:null,platform:"pc"},e&&Object.assign(this.mConfig,e),this.intervalId=setInterval((function(){var e=new XMLHttpRequest;e.open("GET","./package.json",!0),e.addEventListener("load",(function(){var r=JSON.parse(e.response).version;o.version!==r&&(confirm("检测到新版本，是否刷新更新到最新版？")&&t.mReload&&t.mReload())})),e.send(null)}),144e5),Promise.all([r.e(2),r.e(0)]).then(r.bind(null,2)).then((function(e){t.world=new e.World(t.config,t.mCompleteFunc),t.disableClick()}))}return Object.defineProperty(Launcher.prototype,"config",{get:function(){return this.mConfig},enumerable:!0,configurable:!0}),Launcher.start=function(e){return new this(e)},Launcher.prototype.enableClick=function(){this.world&&this.world.enableClick()},Launcher.prototype.disableClick=function(){this.world&&this.world.disableClick()},Launcher.prototype.startFullscreen=function(){this.world&&this.world.startFullscreen()},Launcher.prototype.stopFullscreen=function(){this.world&&this.world.stopFullscreen()},Launcher.prototype.registerReload=function(e){this.mReload=e},Launcher.prototype.registerComplete=function(e){this.mCompleteFunc=e},Launcher.prototype.onResize=function(e,t,r){this.world&&(r&&(this.mConfig.ui_scale=r),this.world.resize(e,t))},Launcher.prototype.onOrientationChange=function(e,t,r){this.world&&this.world.onOrientationChange(e,t,r)},Launcher.prototype.destroy=function(){this.intervalId&&clearInterval(this.intervalId),this.world&&this.world.destroy()},Launcher}()}])}));