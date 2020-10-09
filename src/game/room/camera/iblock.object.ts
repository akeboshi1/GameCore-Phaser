import { LogicPos } from "../../../utils/logic.pos";

export interface IBlockObject {
    readonly id: number;

    readonly type: number;

    getPosition(): LogicPos;

    getPosition45(): LogicPos;

    setRenderable(isRenderable: boolean, delay?: number): void;

    getRenderable(): boolean;

    setBlockable(val: boolean): this;
}
