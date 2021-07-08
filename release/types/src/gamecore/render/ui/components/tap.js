import { ClickEvent } from "apowophaserui";
var Tap = /** @class */ (function () {
    function Tap(gameobject) {
        this.gameobject = gameobject;
        this.isDown = false;
        this.addListener();
    }
    Tap.prototype.addListener = function () {
        this.gameobject.on("pointerdown", this.onGameObjectDownHandler, this);
        this.gameobject.on("pointerup", this.onGameObjectUpHandler, this);
        this.gameobject.on("pointerout", this.onGameObjectOutHandler, this);
    };
    Tap.prototype.removeListener = function () {
        this.gameobject.off("pointerdown", this.onGameObjectDownHandler, this);
        this.gameobject.off("pointerup", this.onGameObjectUpHandler, this);
        this.gameobject.off("pointerout", this.onGameObjectOutHandler, this);
    };
    Tap.prototype.onGameObjectDownHandler = function (pointer, gameobject) {
        this.isDown = true;
    };
    Tap.prototype.onGameObjectUpHandler = function (pointer, gameobject) {
        if (!this.isDown) {
            return;
        }
        this.isDown = false;
        this.gameobject.emit(ClickEvent.Tap, pointer, gameobject);
    };
    Tap.prototype.onGameObjectOutHandler = function () {
        this.isDown = false;
    };
    return Tap;
}());
export { Tap };
//# sourceMappingURL=tap.js.map