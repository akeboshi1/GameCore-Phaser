import {IDisposeObject} from "../../object/interfaces/IDisposeObject";

export interface ILayoutItem extends IDisposeObject{
    getWidth(): number;
    getHeight(): number;
    setPosX(value: number);
    setPosY(value: number);
}
