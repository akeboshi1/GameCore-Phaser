import { IFramesModel } from "./frames.model";
import { IDragonbonesModel } from "./dragonbones.model";
import { SortRectangle } from "../../utils/sort.rectangle";
import { op_def } from "pixelpai_proto";
import { IElement } from "../element/element";
import { AnimationData } from "../element/sprite";
import { DisplayField } from "./display.object";

export interface ElementDisplay extends Phaser.GameObjects.Container {
    readonly baseLoc: Phaser.Geom.Point;
    readonly element: IElement;

    sortX: number;
    sortY: number;
    sortZ: number;
    changeAlpha(val?: number);
    load(data: IFramesModel | IDragonbonesModel, field?: DisplayField);

    play(animationName: AnimationData, field?: DisplayField);

    removeFromParent(): void;

    fadeIn(callback?: () => void);
    fadeOut(callback?: () => void);

    showNickname(val: string);
    setDisplayBadges(cards: op_def.IBadgeCard[]);
    showRefernceArea();
    hideRefernceArea();
    showEffect();

    destroy(): void;
}
