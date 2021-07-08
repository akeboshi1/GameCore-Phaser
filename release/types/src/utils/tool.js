var Tool = /** @class */ (function () {
    function Tool() {
    }
    /**
     * 判断两个数组是否相同
     * @param a
     * @param b
     * @returns
     */
    Tool.equalArr = function (a, b) {
        if (a.length !== b.length) {
            return false;
        }
        // 循环遍历数组的值进行比较
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    };
    /**
     * scene之间坐标转换
     * @param fromScene 当前所在scene
     * @param pos 需要转换去scene上的position
     */
    Tool.getPosByScenes = function (fromScene, pos) {
        var camera = fromScene.cameras.main;
        var px = pos.x - camera.scrollX;
        var py = pos.y - camera.scrollY;
        return { x: px, y: py };
    };
    /*
    * 两点之间距离公式
    */
    Tool.twoPointDistance = function (p1, p2) {
        var dis = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        return dis;
    };
    /**
     * 两点之间弧度
     * @param baseP
     * @param moveP
     */
    Tool.twoPointRadin = function (baseP, moveP) {
        var x = baseP.x - moveP.x;
        var y = baseP.y - moveP.y;
        var dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var rad = Math.acos(x / dis);
        // 注意：当触屏的位置Y坐标<摇杆的Y坐标，我们要去反值-0~-180
        if (moveP.y < baseP.y) {
            rad = -rad;
        }
        return rad;
    };
    Tool.formatChineseString = function (context, fontSize, lineWidth) {
        if (typeof fontSize === "string")
            fontSize = parseInt(fontSize, 10);
        var wrapWidth = Math.floor(lineWidth / fontSize);
        return this.chunk(context, wrapWidth).join(" ");
    };
    Tool.checkChinese = function (name) {
        var pattern = /[\u4e00-\u9fa5]+/;
        var arr = name.split("");
        for (var i = 0, len = arr.length; i < len; i++) {
            if (pattern.test(arr[i])) {
                return true;
            }
        }
        return false;
    };
    Tool.checkItemName = function (name, checkStr) {
        var checkStrList = checkStr.split("") || [];
        var checkBoo = false;
        checkStrList.forEach(function (str) {
            if (str) {
                var pattern = new RegExp(str);
                var arr = name.split("");
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (pattern.test(arr[i])) {
                        checkBoo = true;
                        break;
                    }
                }
            }
        });
        return checkBoo;
    };
    Tool.calcAngle = function (p1, p2) {
        var angle = Math.atan2((p2.y - p1.y), (p2.x - p1.x));
        return angle * (180 / Math.PI);
    };
    Tool.calculateDirectionByRadin = function (radin) {
        var angle = radin * (180 / Math.PI);
        var direction = -1;
        if (angle > 90) {
            direction = 3;
        }
        else if (angle >= 0) {
            direction = 5;
        }
        else if (angle >= -90) {
            direction = 7;
        }
        else {
            direction = 1;
        }
        return direction;
    };
    Tool.angleToDirections = function (angle, dirMode, out) {
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
                }
                else {
                    out.up = true;
                }
                break;
            case 1: // left & right
                if ((angle > 90) && (angle <= 270)) {
                    out.left = true;
                }
                else {
                    out.right = true;
                }
                break;
            case 2: // 4 dir
                if ((angle > 45) && (angle <= 135)) {
                    out.down = true;
                }
                else if ((angle > 135) && (angle <= 225)) {
                    out.left = true;
                }
                else if ((angle > 225) && (angle <= 315)) {
                    out.up = true;
                }
                else {
                    out.right = true;
                }
                break;
            case 3: // 8 dir
                if ((angle > 22.5) && (angle <= 67.5)) {
                    out.down = true;
                    out.right = true;
                }
                else if ((angle > 67.5) && (angle <= 112.5)) {
                    out.down = true;
                }
                else if ((angle > 112.5) && (angle <= 157.5)) {
                    out.down = true;
                    out.left = true;
                }
                else if ((angle > 157.5) && (angle <= 202.5)) {
                    out.left = true;
                }
                else if ((angle > 202.5) && (angle <= 247.5)) {
                    out.left = true;
                    out.up = true;
                }
                else if ((angle > 247.5) && (angle <= 292.5)) {
                    out.up = true;
                }
                else if ((angle > 292.5) && (angle <= 337.5)) {
                    out.up = true;
                    out.right = true;
                }
                else {
                    out.right = true;
                }
                break;
        }
        return out;
    };
    Tool.checkPointerContains = function (gameObject, pointer) {
        if (!gameObject)
            return false;
        var left = -gameObject.width / 2;
        var right = gameObject.width / 2;
        var top = -gameObject.height / 2;
        var bottom = gameObject.height / 2;
        if (pointer) {
            var worldMatrix = gameObject.getWorldTransformMatrix();
            var zoom = worldMatrix.scaleX;
            var x = (pointer.x - worldMatrix.tx) / zoom;
            var y = (pointer.y - worldMatrix.ty) / zoom;
            if (left <= x && right >= x && top <= y && bottom >= y) {
                return true;
            }
            return false;
        }
        return false;
    };
    Tool.baseName = function (str) {
        var base = new String(str).substring(str.lastIndexOf("/") + 1);
        if (base.lastIndexOf(".") !== -1)
            base = base.substring(0, base.lastIndexOf("."));
        return base;
    };
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
    Tool.isNumeric = function (str) {
        if (typeof str !== "string")
            return false; // we only process strings!
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
    };
    Tool.chunk = function (str, n) {
        var result = [];
        for (var i = 0; i < str.length; i += n) {
            result.push(str.substr(i, n));
        }
        return result;
    };
    return Tool;
}());
export { Tool };
//# sourceMappingURL=tool.js.map