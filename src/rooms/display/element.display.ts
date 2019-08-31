import {IFramesModel} from "./frames.model";
import {IDragonbonesModel} from "./dragonbones.model";

export interface ElementDisplay {
    readonly GameObject: Phaser.GameObjects.Container;
    x: number;
    y: number;
    z: number;
    load(data: IFramesModel | IDragonbonesModel);

    removeFromParent(): void;
    destroy(): void;
}
