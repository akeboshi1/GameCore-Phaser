import { IDragonbonesModel } from "./dragonbones.model";
import { op_def } from "pixelpai_proto";
import { IElement } from "../element/element";
import { DisplayField } from "./display.object";
import { IFramesModel } from "../../../game/room/display/iframe.model";
import { AnimationData } from "../../../game/room/display/ianimation";

export interface ElementDisplay extends Phaser.GameObjects.Container {
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

    setDisplayBadges(cards: op_def.IBadgeCard[]);
    showRefernceArea();
    hideRefernceArea();
    showEffect();

    destroy(): void;
}
