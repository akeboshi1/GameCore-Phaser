import { Sprite } from "baseGame";
import { AnimationsNode, ElementNode, TerrainNode } from "game-capsule";
import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { EditorDragonbonesDisplay } from "./editor.dragonbones.display";
export declare class EditorFactory {
    private sceneEditor;
    constructor(sceneEditor: SceneEditorCanvas);
    createDisplay(sprite: Sprite): EditorFramesDisplay | EditorDragonbonesDisplay;
    createDragonbonesDisplay(sprite: Sprite): EditorDragonbonesDisplay;
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
