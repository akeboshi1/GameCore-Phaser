import { IFramesModel } from "./frames.model";
import { IDragonbonesModel } from "./dragonbones.model";
import { DisplayField } from "./display.object";
import { PlayAnimation } from "./animation";

export interface ElementDisplay extends Phaser.GameObjects.Container {
    sortX: number;
    sortY: number;
    sortZ: number;
    changeAlpha(val?: number);
    load(data: IFramesModel | IDragonbonesModel, field?: DisplayField);

    play(animationName: PlayAnimation, field?: DisplayField);

    removeFromParent(): void;

    fadeIn(callback?: () => void);
    fadeOut(callback?: () => void);

    showRefernceArea();
    hideRefernceArea();

    destroy(): void;
}
