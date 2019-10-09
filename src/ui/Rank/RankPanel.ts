import {BasicRankPanel} from "./BasicRankPanel";
import {WorldService} from "../../game/world.service";

export class RankPanel extends BasicRankPanel {
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mZoomSize: number[] = [30, 362];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    protected init() {
        super.init();
        const size = this.mWorld.getSize();
        this.x = size.width - 371 - 10;
        this.y = 21;
        // this.mZoonInBtn = this.mScene.make.image()
    }
}
