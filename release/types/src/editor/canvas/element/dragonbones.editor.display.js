var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { DragonbonesModel } from "baseGame";
import { BaseDragonbonesDisplay } from "baseRender";
import { Logger } from "structure";
import version from "../../../../version";
var DragonbonesEditorDisplay = /** @class */ (function (_super) {
    __extends_1(DragonbonesEditorDisplay, _super);
    function DragonbonesEditorDisplay(scene, mWebHomePath) {
        return _super.call(this, scene, { resPath: "./resources_v" + version + "/", osdPath: mWebHomePath }) || this;
    }
    DragonbonesEditorDisplay.prototype.load = function () {
        var display = new DragonbonesModel({
            id: 0, avatar: {
                id: "0",
                headBaseId: "0001",
                headHairId: "5cd28238fb073710972a73c2",
                headEyesId: "5cd28238fb073710972a73c2",
                headMousId: "5cd28238fb073710972a73c2",
                bodyBaseId: "0001",
                bodyCostId: "5cd28238fb073710972a73c2",
                farmBaseId: "0001",
                barmBaseId: "0001",
                flegBaseId: "0001",
                blegBaseId: "0001"
            }
        });
        return _super.prototype.load.call(this, display, undefined, false);
    };
    DragonbonesEditorDisplay.prototype.displayCreated = function () {
        _super.prototype.displayCreated.call(this);
        this.clearArmatureUnusedSlots();
        this.setDraggable(this.mInteractive);
        if (this.mAnimation) {
            this.play(this.mAnimation);
        }
    };
    DragonbonesEditorDisplay.prototype.setDraggable = function (val) {
        if (this.input)
            this.scene.input.setDraggable(this, val);
    };
    DragonbonesEditorDisplay.prototype.stop = function () {
        if (!this.mArmatureDisplay)
            return;
        this.mArmatureDisplay.animation.stop();
    };
    DragonbonesEditorDisplay.prototype.clearArmatureUnusedSlots = function () {
        if (!this.mArmatureDisplay)
            return Logger.getInstance().error("display does not exist. clear ArmatureUnused slots error");
        var slots = this.mArmatureDisplay.armature.getSlots();
        for (var _i = 0, slots_1 = slots; _i < slots_1.length; _i++) {
            var slot = slots_1[_i];
            if (slot) {
                var visible = slot.name.includes("base") ||
                    slot.name.includes("eyes") ||
                    slot.name.includes("mous") ||
                    (slot.name.includes("hair") && !slot.name.includes("back"));
                slot.display.visible = visible;
            }
        }
    };
    return DragonbonesEditorDisplay;
}(BaseDragonbonesDisplay));
export { DragonbonesEditorDisplay };
//# sourceMappingURL=dragonbones.editor.display.js.map