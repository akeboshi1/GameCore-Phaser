import { Helpers } from "game-capsule";
import { FramesModel } from "baseGame";
var Effect = /** @class */ (function () {
    function Effect(game, mOwnerID, bindId) {
        this.game = game;
        this.mOwnerID = mOwnerID;
        this.mBindId = bindId;
        this.mId = Helpers.genId();
    }
    Effect.prototype.updateDisplayInfo = function (frameModel) {
        this.displayInfo = frameModel;
    };
    Effect.prototype.destroy = function () {
        this.game.renderPeer.removeEffect(this.mOwnerID, this.mId);
    };
    Object.defineProperty(Effect.prototype, "bindId", {
        get: function () {
            return this.mBindId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Effect.prototype, "displayInfo", {
        get: function () {
            return this.mDisplayInfo;
        },
        set: function (display) {
            this.mDisplayInfo = display;
            if (display instanceof FramesModel) {
                this.game.renderPeer.addEffect(this.mOwnerID, this.mId, display);
            }
            this.game.emitter.emit("updateDisplayInfo", display);
        },
        enumerable: true,
        configurable: true
    });
    return Effect;
}());
export { Effect };
//# sourceMappingURL=effect.js.map