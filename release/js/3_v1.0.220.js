(this["webpackJsonpTooqingCore"] = this["webpackJsonpTooqingCore"] || []).push([[3],{

/***/ 433:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BagMediator {
    constructor(world) {
        console.log(`BagMediator world: `, world);
    }
}
exports.BagMediator = BagMediator;


/***/ }),

/***/ 444:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const BagMediator_1 = __webpack_require__(433);
class Template {
    constructor() {
    }
    init(worldService) {
        this.world = worldService;
        const bagMediator = new BagMediator_1.BagMediator(worldService);
    }
    preupdate() {
    }
    update() {
    }
    postupdate() {
    }
}
exports.Template = Template;


/***/ })

}]);