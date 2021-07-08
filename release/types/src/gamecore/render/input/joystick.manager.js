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
import { PacketHandler } from "net-socket-packet";
var JoystickManager = /** @class */ (function (_super) {
    __extends_1(JoystickManager, _super);
    function JoystickManager(render) {
        var _this = _super.call(this) || this;
        _this.render = render;
        _this.mScaleRatio = render.scaleRatio;
        _this.mJoystick = _this.render.mainPeer["JoystickManager"];
        return _this;
    }
    JoystickManager.prototype.setScene = function (scene) {
        this.scene = scene;
        if (!scene) {
            return;
        }
        this.onListener();
    };
    JoystickManager.prototype.onListener = function () {
        this.scene.input.on("pointerdown", this.onDownHandler, this);
        this.scene.input.on("pointerup", this.onUpHandler, this);
    };
    JoystickManager.prototype.offListener = function () {
        // this.parentCon.visible = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("pointerdown", this.onDownHandler, this);
        this.scene.input.off("pointerup", this.onUpHandler, this);
    };
    JoystickManager.prototype.destroy = function () {
        this.offListener();
    };
    JoystickManager.prototype.onPointerMoveHandler = function (pointer) {
        this.calcAngle(pointer);
    };
    JoystickManager.prototype.onDownHandler = function (pointer) {
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.calcAngle(pointer);
        this.start();
    };
    JoystickManager.prototype.onUpHandler = function (pointer) {
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        if ((pointer.downX - pointer.upX) > 10 * this.mScaleRatio || Math.abs(pointer.downY - pointer.upY) > 10 * this.mScaleRatio) {
            this.stop();
        }
    };
    JoystickManager.prototype.calcAngle = function (pointer) {
        if (!this.mJoystick) {
            return;
        }
        this.mJoystick.calcAngle(Math.ceil(pointer.worldX / this.mScaleRatio), Math.ceil(pointer.worldY / this.mScaleRatio));
    };
    JoystickManager.prototype.start = function () {
        if (!this.mJoystick) {
            return;
        }
        this.mJoystick.start();
    };
    JoystickManager.prototype.stop = function () {
        if (!this.mJoystick) {
            return;
        }
        this.mJoystick.stop();
    };
    return JoystickManager;
}(PacketHandler));
export { JoystickManager };
//# sourceMappingURL=joystick.manager.js.map