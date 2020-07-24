import { BasicScene } from "./basic.scene";
import { WorldService } from "../game/world.service";

// 编辑器用 Phaser.Scene
export class LoginScene extends BasicScene {
    private world: WorldService;
    constructor() {
        super({ key: LoginScene.name });
    }

    public preload() {
        // this.load.atlas("login", "./resources/ui/login/login.png", "./resources/ui/login/login.json");
    }

    public create() {
        if (this.world) {
            const uimanager = this.world.uiManager;
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
