export class Tool {

    /**
     * 判断两个数组是否相同
     * @param a
     * @param b
     * @returns
     */
    public static equalArr(a: any[], b: any[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        // 循环遍历数组的值进行比较
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * scene之间坐标转换
     * @param fromScene 当前所在scene
     * @param pos 需要转换去scene上的position
     */
    public static getPosByScenes(fromScene, pos): any {
        const camera = fromScene.cameras.main;
        const px = pos.x - camera.scrollX;
        const py = pos.y - camera.scrollY;
        return { x: px, y: py };
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

    public static calcAngle(p1, p2): number {
        const angle = Math.atan2((p2.y - p1.y), (p2.x - p1.x));
        return angle * (180 / Math.PI);
    }

    public static calculateDirectionByRadin(radin: any) {
        const angle = radin * (180 / Math.PI);
        let direction = -1;
        if (angle > 90) {
            direction = 3;
        } else if (angle >= 0) {
            direction = 5;
        } else if (angle >= -90) {
            direction = 7;
        } else {
            direction = 1;
        }
        return direction;
    }

    public static angleToDirections(angle, dirMode, out) {
        if (out === undefined) {
            out = {};
        }

        out.left = false;
        out.right = false;
        out.up = false;
        out.down = false;

        angle = (angle + 360) % 360;
        switch (dirMode) {
            case 0: // up & down
                if (angle < 180) {
                    out.down = true;
                } else {
                    out.up = true;
                }
                break;
            case 1: // left & right
                if ((angle > 90) && (angle <= 270)) {
                    out.left = true;
                } else {
                    out.right = true;
                }
                break;
            case 2: // 4 dir
                if ((angle > 45) && (angle <= 135)) {
                    out.down = true;
                } else if ((angle > 135) && (angle <= 225)) {
                    out.left = true;
                } else if ((angle > 225) && (angle <= 315)) {
                    out.up = true;
                } else {
                    out.right = true;
                }
                break;
            case 3: // 8 dir
                if ((angle > 22.5) && (angle <= 67.5)) {
                    out.down = true;
                    out.right = true;
                } else if ((angle > 67.5) && (angle <= 112.5)) {
                    out.down = true;
                } else if ((angle > 112.5) && (angle <= 157.5)) {
                    out.down = true;
                    out.left = true;
                } else if ((angle > 157.5) && (angle <= 202.5)) {
                    out.left = true;
                } else if ((angle > 202.5) && (angle <= 247.5)) {
                    out.left = true;
                    out.up = true;
                } else if ((angle > 247.5) && (angle <= 292.5)) {
                    out.up = true;
                } else if ((angle > 292.5) && (angle <= 337.5)) {
                    out.up = true;
                    out.right = true;
                } else {
                    out.right = true;
                }
                break;
        }
        return out;
    }

    public static checkPointerContains(gameObject: any, pointer): boolean {
        if (!gameObject) return false;
        const left = -gameObject.width / 2;
        const right = gameObject.width / 2;
        const top = -gameObject.height / 2;
        const bottom = gameObject.height / 2;
        if (pointer) {
            const worldMatrix = gameObject.getWorldTransformMatrix();
            const zoom = worldMatrix.scaleX;
            const x: number = (pointer.x - worldMatrix.tx) / zoom;
            const y: number = (pointer.y - worldMatrix.ty) / zoom;
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

    public static rootName(str: string) {
        const root = new String(str).substring(0, str.lastIndexOf("/")) + "/";
        return root;
    }

    // public static getRectangle(gameObject, scene) {
    //     // 移动超过30个单位，直接表示在移动，不必做点击处理
    //     const rectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    //     let parent = gameObject.parentContainer;
    //     let zoom = gameObject.scale;
    //     while (parent && parent !== scene) {
    //         zoom *= parent.scale;
    //         parent = parent.parentContainer;
    //     }
    //     const worldWidth = gameObject.width * zoom;
    //     const worldHeight = gameObject.height * zoom;
    //     const worldMatrix = gameObject.getWorldTransformMatrix();
    //     rectangle.left = worldMatrix.tx - worldWidth * gameObject.originX;
    //     rectangle.right = worldMatrix.tx + worldWidth * (1 - gameObject.originX);
    //     rectangle.top = worldMatrix.ty - worldHeight * gameObject.originY;
    //     rectangle.bottom = worldMatrix.ty + worldHeight * (1 - gameObject.originY);
    //     return rectangle;
    // }

    // check is string a number. 0001;2.22 return true
    public static isNumeric(str): boolean {
        if (typeof str !== "string") return false; // we only process strings!
        return !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
    }

    private static chunk(str, n) {
        const result = [];
        for (let i = 0; i < str.length; i += n) {
            result.push(str.substr(i, n));
        }
        return result;
    }
}
