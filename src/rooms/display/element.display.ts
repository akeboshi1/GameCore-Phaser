import {IFramesModel} from "./frames.model";
import {IDragonbonesModel} from "./dragonbones.model";

export interface ElementDisplay {
    x: number;
    y: number;
    z: number;
    load(data: IFramesModel | IDragonbonesModel, callBack?: () => void);

    removeFromParent():void;
    destroy(): void;
    readonly GameObject: Phaser.GameObjects.Container;
}
