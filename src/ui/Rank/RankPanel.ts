import {BasicRankPanel} from "./BasicRankPanel";
import {WorldService} from "../../game/world.service";

export class RankPanel extends BasicRankPanel {
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mZoomSize: number[] = [30, 362];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public resize() {
        if (!this.mWorld) {
            return;
        }
        const size = this.mWorld.getSize();
        this.x = size.width - 371 - 10;
        this.y = 21;
    }

    protected init() {
        super.init();
        this.resize();
        // this.mZoonInBtn = this.mScene.make.image()
    }
}
