import { ModuleName } from "structure";
import { BasicScene } from "./basic.scene";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    constructor() {
        super({ key: LoginScene.name });
    }

    public create() {
        super.create();
        if (this.render) {
            this.render.showMediator(ModuleName.LOGIN_NAME, true);
            // const uimanager: UiManager = this.render.uiManager;
            // uimanager.setScene(this);
            // uimanager.showPanel(ModuleName.LOGIN_NAME);
        }
    }

    public init(data?: any) {
        super.init(data);
        if (data) {
            this.render = data;
        }
    }

    public stop() {
        if (this.render) {
            this.render.showMediator(ModuleName.LOGIN_NAME, false);
        }
        super.stop();
    }

    public sleep() {
        if (this.render) {
            this.render.showMediator(ModuleName.LOGIN_NAME, false);
        }
    }
}
