import { BaseConfigData } from "gamecore";
import { IAnimation, IAnimationData, IElement } from "../../structure";
export declare class ElementDataConfig extends BaseConfigData {
    parseJson(json: any): void;
    serializeJson(obj: object): void;
    get(id: string): IElement;
    protected extendAnimationData(element: IElement): void;
    protected createAnimationData(animation: IAnimation): IAnimationData;
}
