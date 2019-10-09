import {BasicRankPanel} from "../Rank/BasicRankPanel";
import {WorldService} from "../../game/world.service";
import {CloseButton} from "../../utils/resUtil";

export class ComponentRankPanel extends BasicRankPanel {
    private mCloseBtn: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    protected preload() {
        this.scene.load.spritesheet(CloseButton.getName(), CloseButton.getPNG(), CloseButton.getFrameConfig());
        super.preload();
    }

    protected init() {
        super.init();
    }
}
