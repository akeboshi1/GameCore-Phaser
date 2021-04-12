import { Render } from "../../render";
import { ChatCommandInterface, IPos, IPosition45Obj } from "utils";
export declare class Astar {
    private render;
    private readonly CIRCLE_RADIUS_POINTS;
    private readonly CIRCLE_RADIUS_START_POSITION;
    private readonly CIRCLE_RADIUS_TARGET_POSITION;
    private readonly CIRCLE_COLOR_POINTS_PASS;
    private readonly CIRCLE_COLOR_POINTS_NOTPASS;
    private readonly CIRCLE_COLOR_START_POSITION;
    private readonly CIRCLE_COLOR_TARGET_POSITION;
    private readonly LINE_COLOR_PATH;
    private mPointsShowType;
    private mPoints_Walkable;
    private mPoints_NotWalkable;
    private mPath;
    private mAstarSize;
    constructor(render: Render);
    destroy(): void;
    initData(map: number[][], size: IPosition45Obj): void;
    updateData(x: number, y: number, val: boolean): void;
    showPath(start: IPos, tar: IPos, path: IPos[]): void;
    drawPoints(): Promise<void>;
    clearAll(): void;
    private clearPath;
    private drawPath;
}
export declare class AstarDebugger implements ChatCommandInterface {
    static getInstance(): AstarDebugger;
    private static _instance;
    isDebug: boolean;
    private mAstar;
    constructor();
    setDebugger(grids: Astar): void;
    q(): void;
    v(): void;
}
