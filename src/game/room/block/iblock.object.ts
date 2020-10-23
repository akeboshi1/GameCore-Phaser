import { IPos } from "utils";

export interface IBlockObject {
    readonly id: number;

    readonly type: number;

    getPosition(): IPos;

    getPosition45(): IPos;

    setRenderable(isRenderable: boolean, delay?: number): void;

    getRenderable(): boolean;

    setBlockable(val: boolean): this;
}
