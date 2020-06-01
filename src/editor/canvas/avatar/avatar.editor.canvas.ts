import { EditorCanvas, IEditorCanvasConfig } from "../editor.canvas";
import { Logger } from "../../../utils/log";

export class AvatarEditorCanvas extends EditorCanvas {
    constructor(config: IEditorCanvasConfig) {
        super(config);
        Logger.getInstance().log("AvatarEditorCanvas.constructor()");

    }

    public destroy() {
        Logger.getInstance().log("AvatarEditorCanvas.destroy()");

        super.destroy();
    }
}