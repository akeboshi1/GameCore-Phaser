export class ChineseUnit {
    static getChineseUnit(number, decimalDigit) {
        const me = this;
        decimalDigit = decimalDigit == null ? 2 : decimalDigit;
        const integer = Math.floor(number);
        const digit = me.getDigit(integer);
        // ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
        const unit = [];
        if (digit > 3) {
            const multiple = Math.floor(digit / 8);
            if (multiple >= 1) {
                const tmp = Math.round(integer / Math.pow(10, 8 * multiple));
                unit.push(me.addWan(tmp, number, 8 * multiple, decimalDigit));
                for (let i = 0; i < multiple; i++) {
                    unit.push("亿");
                }
                return unit.join("");
            } else {
                return me.addWan(integer, number, 0, decimalDigit);
            }
        } else {
            return number;
        }
    }
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

    private static addWan(integer, number, mutiple, decimalDigit) {
        const me = this;
        const digit = me.getDigit(integer);
        if (digit > 3) {
            let remainder = digit % 8;
            if (remainder >= 5) { // ‘十万’、‘百万’、‘千万’显示为‘万’
                remainder = 4;
            }
            return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + "万";
        } else {
            return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit);
        }
    }
    private static getDigit(integer) {
        let digit = -1;
        while (integer >= 1) {
            digit++;
            integer = integer / 10;
        }
        return digit;
    }
}
