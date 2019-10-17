import { IFramesModel } from "./frames.model";
import { IDragonbonesModel } from "./dragonbones.model";
import { DisplayField } from "./frames.display";
import { SortRectangle } from "../../utils/sort.rectangle";
import {op_def} from "pixelpai_proto";

export interface ElementDisplay extends Phaser.GameObjects.Container {
    readonly baseLoc: Phaser.Geom.Point;
    readonly sortRectangle: SortRectangle;

    sortX: number;
    sortY: number;
    changeAlpha(val?: number);
    load(data: IFramesModel | IDragonbonesModel, field?: DisplayField);

    play(animationName: string, field?: DisplayField);

    setPosition(x?: number, y?: number, z?: number);

    removeFromParent(): void;

    fadeIn(callback?: () => void);
    fadeOut(callback?: () => void);

    showNickname(val: string);
    setDisplayBadges(cards: op_def.IBadgeCard[]);
    showEffect();

    destroy(): void;
}
