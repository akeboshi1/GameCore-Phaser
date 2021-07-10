export declare class Tool {
    /**
     * 判断两个数组是否相同
     * @param a
     * @param b
     * @returns
     */
    static equalArr(a: any[], b: any[]): boolean;
    /**
     * scene之间坐标转换
     * @param fromScene 当前所在scene
     * @param pos 需要转换去scene上的position
     */
    static getPosByScenes(fromScene: any, pos: any): any;
    static twoPointDistance(p1: any, p2: any): number;
    /**
     * 两点之间弧度
     * @param baseP
     * @param moveP
     */
    static twoPointRadin(baseP: any, moveP: any): number;
    static formatChineseString(context: string, fontSize: number | string, lineWidth: number): string;
    static checkChinese(name: string): boolean;
    static checkItemName(name: string, checkStr: string): boolean;
    static calcAngle(p1: any, p2: any): number;
    static calculateDirectionByRadin(radin: any): number;
    static angleToDirections(angle: any, dirMode: any, out: any): any;
    static checkPointerContains(gameObject: any, pointer: any): boolean;
    static baseName(str: any): string;
    static isNumeric(str: any): boolean;
    private static chunk;
}
