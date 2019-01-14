import BaseSingleton from "../../base/BaseSingleton";
import * as pako from "pako";
import {Log} from "../../Log";
import {Const} from "../const/Const";

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

    public mapDecode(mapData: string, compression: string, encoding: string) {
        // Get some base64 encoded binary data from the server. Imagine we got this:
        // var b64Data     = "eJztV9GOwzAI+6FN6u5p//9lUw5xwYDp1JCXU4WUReu6GGxTejzez5/n8bhjLV6/VdT19bffddphTpP9ONPjmGh2YJAs9VxEMa/pOq7vQyGn26pI9bFGc93Fi801q4KtWbf2JgP4jdVkzssOpSAeX/8Mrf1lzKJfS1lloou9prKrVvu9/mcsnfEcUasm9dNn1KlBxjxj2/9+Zo67nm7F9R+Vxqpfa2BdoWcnMyz8KYQ66OpFGddRk4z96CrmNlQt+q3D/REh83rNS/4/eMeaJvgzzbs5IvM4Yn4dSGuv8Y5bsVF5NVP3ddSRL65T5rlaUx3qjTl/15/qrGq39nXhTAcMH6qS1TffS7wvq4Jjwwyimyo++D0D69jpes2D+QSMk3nehSsds2p75ON+2a95sH6ynE9mTNfxLsxgHX098fCOG99RzmYU4Uz0jcq5pnjerXJffjfFZ3nN/0D0sl/RkJ1Lsimonvcybc0ris+ugrVn1sf3U965ccqUb7GCVgtdb3X8TTLXd1bniKwPn7KgXNkeGucFW2tktA+PZWSuypdlDbFaLVqdddYJlcLeLKMruxxaVcyf5F29I5CPydbewGdOf0UZ7+iY/pO85u+44447/nF8AF258Ys=";
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
