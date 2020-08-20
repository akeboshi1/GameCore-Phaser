import { BasePanel } from "./BasePanel";
import { WorldService } from "../../game/world.service";
import { FrameAnimation } from "../../rooms/Animation/frame.animation";
export class LoadingView extends BasePanel {
    private key: string = "loading_ui";
    private sprite: FrameAnimation;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.disInteractive();
    }

    show(config) {
    }

    preload() {
        this.addAtlas(this.key, "pica_alert/pica_alert.png", "pica_alert/pica_alert.json");
        super.preload();
    }

    protected init() {
        super.init();
    }
}
