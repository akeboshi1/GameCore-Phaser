(this["webpackJsonpTooqingCore"] = this["webpackJsonpTooqingCore"] || []).push([[0],{

/***/ "./src/module/template/main.js":
/*!*************************************!*\
  !*** ./src/module/template/main.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst BagMediator_1 = __webpack_require__(/*! ./ui/Bag/BagMediator */ \"./src/module/template/ui/Bag/BagMediator.js\");\r\nclass Template {\r\n    constructor() {\r\n    }\r\n    init(worldService) {\r\n        this.world = worldService;\r\n        const bagMediator = new BagMediator_1.BagMediator(worldService);\r\n    }\r\n    preupdate() {\r\n    }\r\n    update() {\r\n    }\r\n    postupdate() {\r\n    }\r\n}\r\nexports.Template = Template;\r\n\n\n//# sourceURL=webpack://TooqingCore/./src/module/template/main.js?");

/***/ }),

/***/ "./src/module/template/ui/Bag/BagMediator.js":
/*!***************************************************!*\
  !*** ./src/module/template/ui/Bag/BagMediator.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nclass BagMediator {\r\n    constructor(world) {\r\n        console.log(`BagMediator world: `, world);\r\n    }\r\n}\r\nexports.BagMediator = BagMediator;\r\n\n\n//# sourceURL=webpack://TooqingCore/./src/module/template/ui/Bag/BagMediator.js?");

/***/ })

}]);