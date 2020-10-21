import { UiManager } from "../ui/ui.manager";
import { BasicScene } from "./basic.scene";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    constructor() {
        super({ key: LoginScene.name });
    }

    public create() {
        if (this.render) {
            const uimanager: UiManager = this.render.uiManager;
            uimanager.setScene(this);
            uimanager.showPanel("Login");
        }
    }

    public init(data?: any) {
        super.init(data);
        if (data) {
            this.render = data;
        }
    }
}
