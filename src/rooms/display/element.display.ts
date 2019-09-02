import {IFramesModel} from "./frames.model";
import {IDragonbonesModel} from "./dragonbones.model";

export interface ElementDisplay {
    readonly GameObject: Phaser.GameObjects.Container;
    readonly baseLoc: Phaser.Geom.Point;

    x: number;
    y: number;
    z: number;
    load(data: IFramesModel | IDragonbonesModel);
    play(animationName: string);

    removeFromParent(): void;
    destroy(): void;
}
