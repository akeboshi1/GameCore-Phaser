import { Pos } from "./pos";

export class Tool {
    /**
     * scene之间坐标转换
     * @param fromScene 当前所在scene
     * @param pos 需要转换去scene上的position
     */
    public static getPosByScenes(fromScene: Phaser.Scene, pos: Pos): Pos {
        const camera = fromScene.cameras.main;
        const px = pos.x - camera.scrollX;
        const py = pos.y - camera.scrollY;
        return new Pos(px, py);
    }
    /*
    * 两点之间距离公式
    */
    public static twoPointDistance(p1, p2) {
        const dis = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        return dis;
    }

    /**
     * 两点之间弧度
     * @param baseP
     * @param moveP
     */
    public static twoPointRadin(baseP, moveP): number {
        const x = baseP.x - moveP.x;
        const y = baseP.y - moveP.y;
        const dis: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let rad = Math.acos(x / dis);
        // 注意：当触屏的位置Y坐标<摇杆的Y坐标，我们要去反值-0~-180
        if (moveP.y < baseP.y) {
            rad = -rad;
        }
        return rad;
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

    public static checkPointerContains(gameObject: any, pointer: Phaser.Input.Pointer): boolean {
        const left = -gameObject.width / 2;
        const right = gameObject.width / 2;
        const top = -gameObject.height / 2;
        const bottom = gameObject.height / 2;
        if (pointer) {
            const worldMatrix: Phaser.GameObjects.Components.TransformMatrix = gameObject.getWorldTransformMatrix();
            const x: number = pointer.x - worldMatrix.tx;
            const y: number = pointer.y - worldMatrix.ty;
            if (left <= x && right >= x && top <= y && bottom >= y) {
                return true;
            }
            return false;
        }
        return false;
    }

    public static baseName(str) {
        let base = new String(str).substring(str.lastIndexOf("/") + 1);
        if (base.lastIndexOf(".") !== -1)
            base = base.substring(0, base.lastIndexOf("."));
        return base;
    }

    private static chunk(str, n) {
        const result = [];
        for (let i = 0; i < str.length; i += n) {
            result.push(str.substr(i, n));
        }
        return result;
    }
}
