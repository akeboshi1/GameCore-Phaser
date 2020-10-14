import * as Chance from "chance";

export default class Helpers {
    static readonly MAX_ID: number = Math.pow(2, 31);
    static genId(): number {
        return new Chance().natural({
            min: 10000,
            max: Helpers.MAX_ID
        });
    }

    static flipArray<T>(source: T[][]): any[][] {
        if (!source) return;
        const array = [...source];
        const result: T[][] = [];
        if (array.length > 0) {
            const len = array[0].length;
            for (let i = 0; i < len; i++) {
                result[i] = [];
                for (const j of array) {
                    result[i].push(j[i]);
                }
            }
        }
        return result;
    }

    static openUrl(url: string) {
        const tempwindow = window.open("", "_blank"); // 先打开页面
        if (tempwindow) tempwindow.location.href = url; // 后更改页面地址
    }
}
