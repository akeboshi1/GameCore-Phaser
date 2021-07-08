var NumberUtils = /** @class */ (function () {
    function NumberUtils() {
    }
    NumberUtils.NumberConvertZHCN = function (number) {
        var map = { "0": "零", "1": "一", "2": "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八", 9: "九" };
        var convert = "";
        var numberstr = number + "";
        for (var _i = 0, numberstr_1 = numberstr; _i < numberstr_1.length; _i++) {
            var n = numberstr_1[_i];
            var temp = map[n];
            convert += temp;
        }
        return convert;
    };
    return NumberUtils;
}());
export { NumberUtils };
//# sourceMappingURL=number.utils.js.map