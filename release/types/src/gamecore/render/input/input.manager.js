import { JoystickManager } from "./joystick.manager";
import { MouseManager } from "./mouse.manager";
var InputManager = /** @class */ (function () {
    function InputManager(render) {
        this.render = render;
        this.mMouseManager = new MouseManager(render);
    }
    InputManager.prototype.showJoystick = function () {
        this.mJoystickManager = new JoystickManager(this.render);
        this.mJoystickManager.setScene(this.mScene);
    };
    InputManager.prototype.setScene = function (scene) {
        this.mScene = scene;
        this.mMouseManager.changeScene(scene);
        if (this.mJoystickManager)
            this.mJoystickManager.setScene(scene);
    };
    InputManager.prototype.resize = function (width, height) {
        this.mMouseManager.resize(width, height);
    };
    InputManager.prototype.update = function (time, delta) {
    };
    InputManager.prototype.destroy = function () {
        if (this.mMouseManager)
            this.mMouseManager.destroy();
        if (this.mJoystickManager)
            this.mJoystickManager.destroy();
    };
    InputManager.prototype.changeMouseManager = function (mng) {
        if (this.mMouseManager)
            this.mMouseManager.destroy();
        this.mMouseManager = mng;
        if (this.mScene)
            this.mMouseManager.changeScene(this.mScene);
    };
    return InputManager;
}());
export { InputManager };
//# sourceMappingURL=input.manager.js.map