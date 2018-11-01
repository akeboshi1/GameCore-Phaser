import BaseSingleton from "../../base/BaseSingleton";
import * as pako from "pako";
import {Log} from "../../Log";
import {Const} from "../../const/Const";

export class Tool extends BaseSingleton {
    public SMALLEST_NUMBER: number = 0.000001;
    public DOUBLE_PI: number = Math.PI * 2;//360

    public constructor() {
        super();
    }

    /**
     * 清空数组
     */
    public clearArray(arr: any[]): void {
        if (arr) {
            arr.splice(0, arr.length);
        }
    }

    public isRectangleOverlap(rect0X: number, rect0Y: number,
                              rect0Width: number, rect0Height: number,
                              rect1X: number, rect1Y: number,
                              rect1Width: number, rect1Height: number): boolean {
        if (rect0X + rect0Width < rect1X) return false;
        else if (rect0X > rect1X + rect1Width) return false;

        if (rect0Y + rect0Height < rect1Y) return false;
        else if (rect0Y > rect1Y + rect1Height) return false;

        return true;
    }

    /**
     * 根据两点确定这两点连线的二元一次方程 iosY = ax + b或者 iosX = ay + b
     * @param ponit1
     * @param point2
     * @param type        指定返回函数的形式。为0则根据x值得到y，为1则根据y得到x
     *
     * @return 由参数中两点确定的直线的二元一次函数
     */
    public getLineFunc(ponit1: Phaser.Point, point2: Phaser.Point, type: number = 0): Function {
        let resultFuc: Function = null;


        // 先考虑两点在一条垂直于坐标轴直线的情况，此时直线方程为 iosY = a 或者 iosX = a 的形式
        if (ponit1.x === point2.x) {
            if (type === 0) {
                Log.trace("两点所确定直线垂直于y轴，不能根据x值得到y值");
            }
            else {
                resultFuc = function (y: number): number {
                    return ponit1.x;
                }
            }

            return resultFuc;
        }
        else if (ponit1.y === point2.y) {
            if (type === 1) {
                Log.trace("两点所确定直线垂直于y轴，不能根据x值得到y值");
            }
            else {
                resultFuc = function (x: number): number {
                    return ponit1.y;
                }
            }

            return resultFuc;
        }

        // 当两点确定直线不垂直于坐标轴时直线方程设为 iosY = ax + b
        let a: number;

        // 根据
        // y1 = ax1 + b
        // y2 = ax2 + b
        // 上下两式相减消去b, 得到 a = ( y1 - y2 ) / ( x1 - x2 )
        a = (ponit1.y - point2.y) / (ponit1.x - point2.x);

        let b: number;

        // 将a的值代入任一方程式即可得到b
        b = ponit1.y - a * ponit1.x;

        // 把a,b值代入即可得到结果函数
        if (type === 0) {
            resultFuc = function (x: number): number {
                return a * x + b;
            }
        }
        else if (type === 1) {
            resultFuc = function (y: number): number {
                return (y - b) / a;
            }
        }

        return resultFuc;
    }

    public isOverlapCircleAndRectangle(circleCenterX: number,
                                       circleCenterY: number,
                                       circleRadius: number,
                                       rectX: number, rectY: number,
                                       rectWidth: number, rectHeight: number): boolean {
        if (circleCenterX + circleRadius < rectX) return false;
        else if (circleCenterX - circleRadius > rectX + rectWidth) return false;

        if (circleCenterY + circleRadius < rectY) return false;
        else if (circleCenterY - circleRadius > rectY + rectHeight) return false;

        return true;
    }

    public mapDecode(mapData) {
        // Get some base64 encoded binary data from the server. Imagine we got this:
        // var b64Data     = 'eJztV9GOwzAI+6FN6u5p//9lUw5xwYDp1JCXU4WUReu6GGxTejzez5/n8bhjLV6/VdT19bffddphTpP9ONPjmGh2YJAs9VxEMa/pOq7vQyGn26pI9bFGc93Fi801q4KtWbf2JgP4jdVkzssOpSAeX/8Mrf1lzKJfS1lloou9prKrVvu9/mcsnfEcUasm9dNn1KlBxjxj2/9+Zo67nm7F9R+Vxqpfa2BdoWcnMyz8KYQ66OpFGddRk4z96CrmNlQt+q3D/REh83rNS/4/eMeaJvgzzbs5IvM4Yn4dSGuv8Y5bsVF5NVP3ddSRL65T5rlaUx3qjTl/15/qrGq39nXhTAcMH6qS1TffS7wvq4Jjwwyimyo++D0D69jpes2D+QSMk3nehSsds2p75ON+2a95sH6ynE9mTNfxLsxgHX098fCOG99RzmYU4Uz0jcq5pnjerXJffjfFZ3nN/0D0sl/RkJ1Lsimonvcybc0ris+ugrVn1sf3U965ccqUb7GCVgtdb3X8TTLXd1bniKwPn7KgXNkeGucFW2tktA+PZWSuypdlDbFaLVqdddYJlcLeLKMruxxaVcyf5F29I5CPydbewGdOf0UZ7+iY/pO85u+44447/nF8AF258Ys=';

        // Decode base64 (convert ascii to binary)
        let strData = atob(mapData);

        // Convert binary string to character-number array
        let charData = strData.split('').map(function (x) {
            return x.charCodeAt(0);
        });

        // Turn number array into byte-array
        let binData = new Uint8Array(charData);

        // Pako magic
        let data = pako.inflate(binData);

        // Convert gunzipped byteArray back to ascii string:
        let str = String.fromCharCode.apply(null, new Uint16Array(data));
        // console.log(`str: ${str}`);
        let result = str.split(",");
        return result;
    }

    /**
     * Bound a number by a minimum and maximum.
     * Ensures that this number is no smaller than the minimum,
     * and no larger than the maximum.
     *
     * @param    Value    Any number.
     * @param    Min        Any number.
     * @param    Max        Any number.
     *
     * @return    The bounded value of the number.
     */
    public clamp(value: number, min: number, max: number): number {
        // var lowerBound:number = (Value<Min)?Min:Value;
        // return (lowerBound>Max)?Max:lowerBound;
        return value < min ? min : (value > max ? max : value);
    }

    public caculateDirectionRadianByTwoPoint2(startX: number, startY: number, endX: number, endY: number): number {
        return this.adjustRadianBetween0And2PI(Math.atan2(endY - startY, endX - startX));
    }

    public adjustRadianBetween0And2PI(radian: number): number {
        radian %= this.DOUBLE_PI;

        if (radian < 0) {
            radian += this.DOUBLE_PI;
        }

        if (this.DOUBLE_PI - radian < this.SMALLEST_NUMBER) radian = 0;

        return radian;
    }

    public caclNumStr(value: number): string {
        let result: string = "";
        if (value >= 0 && value < 10)
            result = "000" + value;
        if (value >= 10 && value < 100)
            result = "00" + value;
        if (value >= 100 && value < 1000)
            result = "0" + value;
        return result;
    }

    public get45Tile(): number {
        let temp: number = Math.sqrt(Math.pow(Const.GameConst.HALF_MAP_TILE_WIDTH, 2) + Math.pow(Const.GameConst.HALF_MAP_TILE_HEIGHT, 2));
        return temp;
    }

    private ab2str(buf): any {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

}