import {ChatCommandInterface, Logger} from "utils";
import {Render} from "gamecoreRender";

export class EditorModeDebugger implements ChatCommandInterface {
    public static getInstance(): EditorModeDebugger {
        if (!EditorModeDebugger._instance) {
            Logger.getInstance().error("SortDebugger not created");
        }
        return EditorModeDebugger._instance;
    }

    private static _instance: EditorModeDebugger;

    public isDebug: boolean = false;

    constructor(private render: Render) {
        EditorModeDebugger._instance = this;
    }

    // export
    public getIsDebug() {
        return this.isDebug;
    }

    public q() {
        if (this.isDebug) {
            this.render.mainPeer.elementsHideReferenceArea();
        }

        this.isDebug = false;
    }

    public v() {
        if (!this.isDebug) {
            this.render.mainPeer.elementsShowReferenceArea();
        }

        this.isDebug = true;
    }
}
