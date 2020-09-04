import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class GMToolsPanel extends BasePanel {
    private background: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    protected init() {

        this.background = this.scene.make.graphics(undefined, false);
        this.background.fillStyle(0x0, 0.6);
        this.add(this.background);
        super.init();
    }
}
