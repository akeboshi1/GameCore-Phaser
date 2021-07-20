import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { Sprite } from "baseGame";
import { IEditorCanvasConfig } from "../editor.canvas";
export declare class EditorElementDisplay extends EditorFramesDisplay {
    constructor(sceneEditor: SceneEditorCanvas, config: IEditorCanvasConfig, sprite: Sprite);
    selected(): void;
    unselected(): void;
    showRefernceArea(): void;
    setSprite(sprite: Sprite): void;
    asociate(): void;
    displayCreated(): void;
    destroy(): void;
    protected addToMap(): void;
    protected removeFromMap(): void;
}
