import { FramesModel, Sprite } from "baseModel";
import { AnimationsNode, ElementNode, TerrainNode } from "game-capsule";
import { AnimationModel, IFramesModel } from "structure";
import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { op_def } from "pixelpai_proto";
import { EditorElementDisplay } from "./editor.element.display";

export class EditorFactory {
    constructor(private sceneEditor: SceneEditorCanvas) {
    }

    public createFramesDisplayBYSprite(sprite: Sprite) {
        // const display = new EditorFramesDisplay(this.sceneEditor.scene, sprite.id, sprite.nodeType, this.sceneEditor);
        let display: EditorFramesDisplay = null;
        if (sprite.nodeType === op_def.NodeType.ElementNodeType) {
            display = new EditorElementDisplay(this.sceneEditor, sprite);
        } else {
            display = new EditorFramesDisplay(this.sceneEditor, sprite);
        }
        display.isMoss = sprite.isMoss;
        // display.sprite = sprite;
        display.updateSprite(sprite);
        return display;
    }

    public createFramesDisplay(element: ElementNode | TerrainNode) {
        const animations = element.animations;
        const frameModel: IFramesModel = this.createFramesModel(animations);

        const display = new EditorFramesDisplay(this.sceneEditor, undefined);
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
