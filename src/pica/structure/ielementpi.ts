import { IAnimation } from "picaStructure";
import { IAnimationData } from "./ielement";

export interface IElementPi {
    itemId: string;
    sn: string;
    type: number;
    name: string;
    des: string;
    dir: number;
    animation_name: string;
    scale: boolean;
    texture_path: string;
    data_path: string;
    Animations: IAnimation[];
    animations: IAnimationData[];
    animationDisplay: { dataPath: string, texturePath: string };
    Attributes: string[];
    Funcs: object;
    combine: number;
    uiid: number;
}
