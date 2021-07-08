var ChineseUnit = /** @class */ (function () {
    function ChineseUnit() {
    }
    /*
    数字转中文
    @number {Integer} 形如123的数字
    @return {String} 返回转换成的形如 一百二十三 的字符串
*/
    ChineseUnit.numberToChinese = function (number, uint) {
        if (uint === void 0) { uint = false; }
        var units = "个十百千万@#%亿^&~";
        var chars = "零一二三四五六七八九";
        var arr = (number + "").split(""), s = [];
        var len = arr.length - 1;
        if (arr.length > 12) {
            throw new Error("too big");
        }
        else {
            for (var i = 0; i <= len; i++) {
                var num = Number(arr[i]);
                if (len === 1 || len === 5 || len === 9) { // 两位数 处理特殊的 1*
                    if (i === 0) {
                        if (arr[i] !== "1")
                            s.push(chars.charAt(num));
                    }
                    else {
                        s.push(chars.charAt(num));
                    }
                }
                else {
                    s.push(chars.charAt(num));
                }
                if (uint) {
                    if (i !== len) {
                        s.push(units.charAt(len - i));
                    }
                }
            }
        }
        if (!uint)
            return s.join("");
        return s.join("").replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) {
            b = units.indexOf(d);
            if (b !== -1) {
                if (d === "亿")
                    return d;
                if (d === "万")
                    return d;
                if (arr[len - b] === "0")
                    return "零";
            }
            return "";
        }).replace(/零+/g, "零").replace(/零([万亿])/g, function (m, b) {
            return b;
        }).replace(/亿[万千百]/g, "亿").replace(/[零]$/, "").replace(/[@#%^&~]/g, function (m) {
            return { "@": "十", "#": "百", "%": "千", "^": "十", "&": "百", "~": "千" }[m];
        }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
            c = units.indexOf(d);
            if (c !== -1) {
                if (arr[len - c] === "0")
                    return d + "零" + b;
            }
            return m;
        });
    };
    ChineseUnit.getChineseUnit = function (number, decimalDigit) {
        var me = this;
        decimalDigit = decimalDigit == null ? 2 : decimalDigit;
        var integer = Math.floor(number);
        var digit = me.getDigit(integer);
        // ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
        var unit = [];
        if (digit > 3) {
            var multiple = Math.floor(digit / 8);
            if (multiple >= 1) {
                var tmp = Math.round(integer / Math.pow(10, 8 * multiple));
                unit.push(me.addWan(tmp, number, 8 * multiple, decimalDigit));
                for (var i = 0; i < multiple; i++) {
                    unit.push("亿");
                }
                return unit.join("");
            }
            else {
                return me.addWan(integer, number, 0, decimalDigit);
            }
        }
        else {
            return number;
        }
    };
    /**
     * 为数字加上单位：万或亿
     *
     * 例如
     * 1000.01 => 1000.01
     * 10000 => 1万
     * 99000 => 9.9万
     * 566000 => 56.6万
     * 5660000 => 566万
     * 44440000 => 4444万
     * 11111000 => 1111.1万
     * 444400000 => 4.44亿
     * 40000000,00000000,00000000 => 4000万亿亿
     * 4,00000000,00000000,00000000 => 4亿亿亿
     *
     * @param {number} number 输入数字.
     * @param {number} decimalDigit 小数点后最多位数，默认为2
     * @return {string} 加上单位后的数字
     */
    ChineseUnit.addWan = function (integer, number, mutiple, decimalDigit) {
        var me = this;
        var digit = me.getDigit(integer);
        if (digit > 3) {
            var remainder = digit % 8;
            if (remainder >= 5) { // ‘十万’、‘百万’、‘千万’显示为‘万’
                remainder = 4;
            }
            return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + "万";
        }
        else {
            return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit);
        }
    };
    ChineseUnit.getDigit = function (integer) {
        var digit = -1;
        while (integer >= 1) {
            digit++;
            integer = integer / 10;
        }
        return digit;
    };
    return ChineseUnit;
}());
export { ChineseUnit };
//# sourceMappingURL=chinese.unit.js.map