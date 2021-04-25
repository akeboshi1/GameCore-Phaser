import { IPos, IPosition45Obj } from "structure";
import { Render } from "../render";
export declare class DebugManager {
    protected render: Render;
    private mAstarDebug;
    private mGridsDebug;
    private matterBodies;
    private serverPosition;
    constructor(render: Render);
    showGridsDebug(size: IPosition45Obj): void;
    hideGridsDebug(): void;
    showAstarDebug_init(map: number[][], posObj: IPosition45Obj): void;
    showAstarDebug_update(x: number, y: number, val: boolean): void;
    showAstarDebug_findPath(start: IPos, tar: IPos, path: IPos[]): void;
    hideAstarDebug(): void;
    showMatterDebug(bodies: any): void;
    hideMatterDebug(): void;
    drawServerPosition(x: number, y: number): void;
    hideServerPosition(): void;
    destroy(): void;
}
