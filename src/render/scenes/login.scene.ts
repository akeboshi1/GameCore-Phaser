import { Render } from "../render";
import { UiManager } from "../ui/ui.manager";
import { BasicScene } from "./basic.scene";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    private render: Render;
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
        if (data) {
            this.render = data;
        }
    }
}
