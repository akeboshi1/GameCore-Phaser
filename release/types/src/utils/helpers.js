var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as Chance from "chance";
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.genId = function () {
        return new Chance().natural({
            min: 10000,
            max: Helpers.MAX_ID
        });
    };
    Helpers.flipArray = function (source) {
        if (!source)
            return;
        var array = __spreadArrays(source);
        var result = [];
        if (array.length > 0) {
            var len = array[0].length;
            for (var i = 0; i < len; i++) {
                result[i] = [];
                for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                    var j = array_1[_i];
                    result[i].push(j[i]);
                }
            }
        }
        return result;
    };
    Helpers.openUrl = function (url) {
        var tempwindow = window.open("", "_blank"); // 先打开页面
        if (tempwindow)
            tempwindow.location.href = url; // 后更改页面地址
    };
    Helpers.MAX_ID = Math.pow(2, 31);
    return Helpers;
}());
export { Helpers };
//# sourceMappingURL=helpers.js.map