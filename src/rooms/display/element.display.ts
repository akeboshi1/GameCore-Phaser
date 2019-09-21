import {IFramesModel} from "./frames.model";
import {IDragonbonesModel} from "./dragonbones.model";
import {DisplayField} from "./frames.display";
import {SortRectangle} from "../../utils/sort.rectangle";

export interface ElementDisplay extends Phaser.GameObjects.Container {
    readonly baseLoc: Phaser.Geom.Point;
    readonly sortRectangle: SortRectangle;

    x: number;
    y: number;
    z: number;

    sortX: number;
    sortY: number;

    load(data: IFramesModel | IDragonbonesModel, field?: DisplayField);

    play(animationName: string, field?: DisplayField);

    setPosition(x?: number, y?: number, z?: number);

    removeFromParent(): void;

    fadeIn(callback?: () => void);
    fadeOut(callback?: () => void);

    destroy(): void;
}
