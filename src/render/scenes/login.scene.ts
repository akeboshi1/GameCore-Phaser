import { UiManager } from "../managers/ui.manager";
import { BasicScene } from "./basic.scene";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    private world: any;
    constructor() {
        super({ key: LoginScene.name });
    }

    public preload() {
        this.load.atlas("login", "./resources/ui/login/login.png", "./resources/ui/login/login.json");
    }

    public create() {
        if (this.world) {
            const uimanager: UiManager = this.world.uiManager;
            uimanager.setScene(this);
            uimanager.showMed("Login");
        }
    }

    public init(data?: any) {
        if (data) {
            this.world = data.world;
        }
    }
}
