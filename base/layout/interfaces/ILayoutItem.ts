import {IDisposeObject} from "../../IDisposeObject";

export interface ILayoutItem extends IDisposeObject{
    getWidth(): number;
    getHeight(): number;
    setPosX(value: number);
    setPosY(value: number);
}