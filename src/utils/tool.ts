export class Tool {
    /*
    * 两点之间距离公式
    */
    public static twoPointDistance(p1, p2) {
        const dis = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        return dis;
    }

    public static formatChineseString(context: string, fontSize: number | string, lineWidth: number) {
        if (typeof fontSize === "string") fontSize = parseInt(fontSize, 10);
        const wrapWidth = Math.floor(lineWidth / fontSize);
        return this.chunk(context, wrapWidth).join(" ");
    }

    public static checkChinese(name: string): boolean {
        const pattern = /[\u4e00-\u9fa5]+/;
        const arr: string[] = name.split("");
        for (let i = 0, len = arr.length; i < len; i++) {
            if (pattern.test(arr[i])) {
                return true;
            }
        }
        return false;
    }

    public static checkItemName(name: string, checkStr: string): boolean {
        const checkStrList: string[] = checkStr.split("") || [];
        let checkBoo: boolean = false;
        checkStrList.forEach((str: string) => {
            if (str) {
                const pattern = new RegExp(str);
                const arr: string[] = name.split("");
                for (let i = 0, len = arr.length; i < len; i++) {
                    if (pattern.test(arr[i])) {
                        checkBoo = true;
                        break;
                    }
                }
            }
        });
        return checkBoo;
    }

    private static chunk(str, n) {
        const result = [];
        for (let i = 0; i < str.length; i += n) {
            result.push(str.substr(i, n));
        }
        return result;
    }
}
