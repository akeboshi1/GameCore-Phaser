import { AnimationModel } from "structure";
import { EditorFramesDisplay } from "./editor.frames.display";
import { op_def } from "pixelpai_proto";
import { EditorElementDisplay } from "./editor.element.display";
import { EditorDragonbonesDisplay } from "./editor.dragonbones.display";
export class EditorFactory {
  constructor(sceneEditor) {
    this.sceneEditor = sceneEditor;
  }
  createDisplay(sprite) {
    if (sprite.avatar) {
      return this.createDragonbonesDisplay(sprite);
    }
    return this.createFramesDisplayBYSprite(sprite);
  }
  createDragonbonesDisplay(sprite) {
    const display = new EditorDragonbonesDisplay(this.sceneEditor.scene, this.sceneEditor.config, sprite);
    display.updateSprite(sprite);
    return display;
  }
  createFramesDisplayBYSprite(sprite) {
    let display = null;
    if (sprite.nodeType === op_def.NodeType.ElementNodeType) {
      display = new EditorElementDisplay(this.sceneEditor, this.sceneEditor.config, sprite);
    } else {
      display = new EditorFramesDisplay(this.sceneEditor, this.sceneEditor.config, sprite);
    }
    display.isMoss = sprite.isMoss;
    display.updateSprite(sprite);
    return display;
  }
  createFramesDisplay(element) {
    const animations = element.animations;
    const frameModel = this.createFramesModel(animations);
    const display = new EditorFramesDisplay(this.sceneEditor, this.sceneEditor.config, void 0);
    display.load(frameModel);
    display.play({ name: animations.defaultAnimationName, flip: false });
    return display;
  }
  createFramesModel(animations) {
    const objAnis = animations.animationDataList;
    const anis = new Map();
    for (const ani of objAnis) {
      anis.set(ani.name, new AnimationModel(ani.createProtocolObject()));
    }
    return {
      discriminator: "FramesModel",
      id: animations.id,
      gene: animations.geneSequence(),
      animationName: animations.defaultAnimationName,
      display: animations.display,
      animations: anis
    };
  }
}
