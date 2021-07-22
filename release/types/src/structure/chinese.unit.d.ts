export declare class ChineseUnit {
    static numberToChinese(number: any, uint?: boolean): string;
    static getChineseUnit(number: any, decimalDigit: any): any;
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
    private static addWan;
    private static getDigit;
}
