import { Render } from "../render";
import { JoystickManager } from "./joystick.manager";
import { MouseManager } from "./mouse.manager";

export class InputManager {
    private mMouseManager: MouseManager;
    private mJoystickManager: JoystickManager;
    private mScene: Phaser.Scene;
    constructor(private render: Render) {
        this.mMouseManager = new MouseManager(render);
    }

    showJoystick() {
        this.mJoystickManager = new JoystickManager(this.render);
        this.mJoystickManager.setScene(this.mScene);
    }

    setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        this.mMouseManager.changeScene(scene);
        if (this.mJoystickManager) this.mJoystickManager.setScene(scene);
    }

    resize(width: number, height: number) {
        this.mMouseManager.resize(width, height);
    }

    public destroy() {
    }
}
