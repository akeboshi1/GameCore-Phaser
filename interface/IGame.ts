/**
 * 游戏基类
 * author aaron
 */
import {IRectangle} from "../base/ds/IRectangle";

export default interface IGame {
    resize(bounds: IRectangle): void;

    dispose(): void;
}
