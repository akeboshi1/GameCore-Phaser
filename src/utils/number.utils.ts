export class NumberUtils {
    static NumberConvertZHCN(number: string) {
        const map = { "0": "零", "1": "一", "2": "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八", 9: "九" };
        let convert: string = "";
        const numberstr = number + "";
        for (const n of numberstr) {
            const temp = map[n];
            convert += temp;
        }
    }
}
