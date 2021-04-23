import { Render } from "../../render";
import { ChatCommandInterface } from "structure";
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
