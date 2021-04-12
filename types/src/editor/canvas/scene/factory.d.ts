import { Sprite } from "baseModel";
import { AnimationsNode, ElementNode, TerrainNode } from "game-capsule";
import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
export declare class EditorFactory {
    private sceneEditor;
    constructor(sceneEditor: SceneEditorCanvas);
    createFramesDisplayBYSprite(sprite: Sprite): EditorFramesDisplay;
    createFramesDisplay(element: ElementNode | TerrainNode): EditorFramesDisplay;
    createFramesModel(animations: AnimationsNode): {
        discriminator: string;
        id: number;
        gene: string;
        animationName: string;
        display: import("game-capsule").DisplayNode;
        animations: Map<string, any>;
    };
}
