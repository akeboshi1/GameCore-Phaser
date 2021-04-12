import { Pos } from "utils";
import { IRender } from "baseRender";
export declare class FallEffectContainer {
    private render;
    private mFalls;
    constructor(render: IRender);
    addFall(pos: Pos, enable: boolean): void;
    private onRemoveHandler;
}
