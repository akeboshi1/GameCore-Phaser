import { Sprite } from "base";
import { AnimationsNode, ElementNode, SpawnPointNode, TerrainNode } from "game-capsule";
import { FramesModel } from "gamecore";
import { AnimationModel, IFramesModel } from "structure";
import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";

export class EditorFactory {
    constructor(private sceneEditor: SceneEditorCanvas) {
    }

    public createFramesDisplayBYSprite(sprite: Sprite) {
        const frameModel: IFramesModel = <FramesModel>sprite.displayInfo;

        const display = new EditorFramesDisplay(this.sceneEditor.scene, sprite.id, sprite.nodeType, this.sceneEditor);
        display.load(frameModel);
        display.play({ name: sprite.currentAnimationName, flip: false });
        return display;
    }

    public createFramesDisplay(element: ElementNode | TerrainNode) {
        const animations = element.animations;
        const frameModel: IFramesModel = this.createFramesModel(animations);

        const display = new EditorFramesDisplay(this.sceneEditor.scene, element.id, 3, this.sceneEditor);
        display.load(frameModel);
        display.play({ name: animations.defaultAnimationName, flip: false });
        return display;
    }

    public createFramesModel(animations: AnimationsNode) {
        const objAnis = animations.animationDataList;
        const anis: Map<string, any> = new Map();
        for (const ani of objAnis) {
            anis.set(ani.name, new AnimationModel(ani.createProtocolObject()));
        }
        return {
            discriminator: "FramesModel",
            id: animations.id,
            gene: animations.geneSequence(),
            animationName: animations.defaultAnimationName,
            display: animations.display,
            animations: anis,
        };
    }
}
