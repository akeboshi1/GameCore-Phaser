import {BasicRankPanel} from "./BasicRankPanel";
import {WorldService} from "../../game/world.service";

export class RankPanel extends BasicRankPanel {
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mCurrentIndex: number;
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
        this.mZoonInBtn = this.scene.make.image({
            x: 158,
            y: 349,
            key: "rank_atlas",
            frame: "arrow.png"
        }, false);
        this.add(this.mZoonInBtn);
        this.resize();
        this.mZoonInBtn.setInteractive();
        this.mZoonInBtn.on("pointerup", this.onZoomHandler, this);
        // this.mZoonInBtn = this.mScene.make.image()
    }

    private onZoomHandler() {
        this.currentSizeIndex = this.mCurrentIndex === 0 ? 1 : 0;
    }

    private set currentSizeIndex(value: number) {
        if (this.mCurrentIndex === value) {
            return;
        }
        this.mCurrentIndex = value;
        const h = this.mZoomSize[this.mCurrentIndex];
        this.mBackground.resize(328, h);
        if (h > 300) {
            this.add(this.mContentContainer);
            this.mZoonInBtn.angle = 180;
        } else {
            this.mZoonInBtn.angle = 0;
            this.remove(this.mContentContainer);
        }
        this.mZoonInBtn.y = h - 13;
    }
}
