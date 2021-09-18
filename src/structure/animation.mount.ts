import { ILogicPoint } from "./logic.point";

export interface IAnimationMountLayer {
    index: number;
    mountPoint?: ILogicPoint[];
    frameVisible?: number[];
}

export class AnimationMountLayer implements IAnimationMountLayer {
    index: number;
    mountPoint?: ILogicPoint[];
    frameVisible?: number[];

    static create() {
        return new AnimationMountLayer();
    }
}
