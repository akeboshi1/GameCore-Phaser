import BaseSingleton from "../../base/BaseSingleton";
import * as pako from "pako";

export class Tool extends BaseSingleton {
    public SMALLEST_NUMBER: number = 0.000001;
    public DOUBLE_PI: number = Math.PI * 2; // 360

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
        if (rect0X + rect0Width < rect1X) {
            return false;
        } else if (rect0X > rect1X + rect1Width) {
            return false;
        }

        if (rect0Y + rect0Height < rect1Y) {
            return false;
        } else if (rect0Y > rect1Y + rect1Height) {
            return false;
        }

        return true;
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

    public mapDecode(mapData: string, compression: string, encoding: string) {
        // Get some base64 encoded binary data from the server. Imagine we got this:
        let strData;
        // Decode base64 (convert ascii to binary)
        if (encoding === "base64") {
            strData = atob(mapData);
        } else {
            strData = mapData;
        }

        let str;
        if (compression === "zlib") {
            // Convert binary string to character-number array
            let charData = strData.split("").map(function (x) {
                return x.charCodeAt(0);
            });

            // Turn number array into byte-array
            let binData = new Uint8Array(charData);

            // Pako magic
            let data = pako.inflate(binData);

            // Convert gunzipped byteArray back to ascii string:
            str = String.fromCharCode.apply(null, new Uint16Array(data));
        } else {
            str = strData;
        }

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
        return Math.atan2(endY - startY, endX - startX);
    }

    public adjustRadianBetween0And2PI(radian: number): number {
        radian %= this.DOUBLE_PI;

        if (radian < 0) {
            radian += this.DOUBLE_PI;
        }

        // if (this.DOUBLE_PI - radian < this.SMALLEST_NUMBER) radian = 0;

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

    private ab2str(buf): any {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

}
