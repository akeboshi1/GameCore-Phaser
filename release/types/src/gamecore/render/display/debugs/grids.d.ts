import { Render } from "../../render";
import { ChatCommandInterface, IPosition45Obj } from "structure";
export declare class Grids {
    private render;
    private mGraphic;
    private mRoomSize;
    constructor(render: Render);
    destroy(): void;
    setData(posObj: IPosition45Obj): void;
    show(): void;
    hide(): void;
    private drawLine;
}
export declare class GridsDebugger implements ChatCommandInterface {
    static getInstance(): GridsDebugger;
    private static _instance;
    isDebug: boolean;
    private mGrids;
    constructor();
    setDebugger(grids: Grids): void;
    q(): void;
    v(): void;
}
