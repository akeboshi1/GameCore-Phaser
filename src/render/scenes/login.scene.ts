import { ModuleName, SceneName } from "structure";
import { UiManager } from "../ui";
import { BasicScene } from "baseRender";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    constructor() {
        super({ key: SceneName.LOGIN_SCENE });
    }

    preload() {
    }

    public create() {
        super.create();
        if (this.render) {
            this.render.showMediator(ModuleName.PICA_BOOT_NAME, true);
            const uimanager: UiManager = this.render.uiManager;
            uimanager.setScene(this);
            this.render.hideLoading();
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
            this.render.showMediator("Login", false);
        }
        super.stop();
    }

    public sleep() {
        if (this.render) {
            this.render.showMediator("Login", false);
        }
    }
}
