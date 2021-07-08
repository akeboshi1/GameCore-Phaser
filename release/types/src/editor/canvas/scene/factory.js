import { AnimationModel } from "structure";
import { EditorFramesDisplay } from "./editor.frames.display";
import { op_def } from "pixelpai_proto";
import { EditorElementDisplay } from "./editor.element.display";
import { EditorDragonbonesDisplay } from "./editor.dragonbones.display";
var EditorFactory = /** @class */ (function () {
    function EditorFactory(sceneEditor) {
        this.sceneEditor = sceneEditor;
    }
    EditorFactory.prototype.createDisplay = function (sprite) {
        if (sprite.avatar) {
            return this.createDragonbonesDisplay(sprite);
        }
        return this.createFramesDisplayBYSprite(sprite);
    };
    EditorFactory.prototype.createDragonbonesDisplay = function (sprite) {
        var display = new EditorDragonbonesDisplay(this.sceneEditor.scene, this.sceneEditor.config, sprite);
        display.updateSprite(sprite);
        return display;
    };
    EditorFactory.prototype.createFramesDisplayBYSprite = function (sprite) {
        // const display = new EditorFramesDisplay(this.sceneEditor.scene, sprite.id, sprite.nodeType, this.sceneEditor);
        var display = null;
        if (sprite.nodeType === op_def.NodeType.ElementNodeType) {
            display = new EditorElementDisplay(this.sceneEditor, this.sceneEditor.config, sprite);
        }
        else {
            display = new EditorFramesDisplay(this.sceneEditor, this.sceneEditor.config, sprite);
        }
        display.isMoss = sprite.isMoss;
        // display.sprite = sprite;
        display.updateSprite(sprite);
        return display;
    };
    EditorFactory.prototype.createFramesDisplay = function (element) {
        var animations = element.animations;
        var frameModel = this.createFramesModel(animations);
        var display = new EditorFramesDisplay(this.sceneEditor, this.sceneEditor.config, undefined);
        display.load(frameModel);
        display.play({ name: animations.defaultAnimationName, flip: false });
        return display;
    };
    EditorFactory.prototype.createFramesModel = function (animations) {
        var objAnis = animations.animationDataList;
        var anis = new Map();
        for (var _i = 0, objAnis_1 = objAnis; _i < objAnis_1.length; _i++) {
            var ani = objAnis_1[_i];
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
    };
    return EditorFactory;
}());
export { EditorFactory };
//# sourceMappingURL=factory.js.map