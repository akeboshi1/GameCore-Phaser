import { ChatCommandInterface } from "utils";
import { Render } from "gamecoreRender";
export declare class EditorModeDebugger implements ChatCommandInterface {
    private render;
    static getInstance(): EditorModeDebugger;
    private static _instance;
    isDebug: boolean;
    constructor(render: Render);
    getIsDebug(): boolean;
    q(): void;
    v(): void;
}
