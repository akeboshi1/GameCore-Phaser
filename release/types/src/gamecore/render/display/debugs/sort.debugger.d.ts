import { ChatCommandInterface } from "structure";
import { Render } from "../../render";
export declare class SortDebugger implements ChatCommandInterface {
    private render;
    static getInstance(): SortDebugger;
    private static _instance;
    isDebug: boolean;
    private readonly RECT_COLOR;
    private mData;
    private mGraphics;
    constructor(render: Render);
    q(): void;
    v(): void;
    clear(): void;
    addDisplayObject(id: number, x: number, y: number, w: number, h: number): void;
    private redraw;
    private drawObj;
}
