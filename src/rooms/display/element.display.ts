import {IFramesModel} from "./frames.model";
import {IDragonbonesModel} from "./dragonbones.model";
import {DisplayField} from "./frames.display";

export interface ElementDisplay extends Phaser.GameObjects.Container {
    readonly baseLoc: Phaser.Geom.Point;

    x: number;
    y: number;
    z: number;

    load(data: IFramesModel | IDragonbonesModel, field?: DisplayField);

    play(animationName: string, field?: DisplayField);

    setPosition(x?: number, y?: number, z?: number);

    removeFromParent(): void;

    destroy(): void;
}
