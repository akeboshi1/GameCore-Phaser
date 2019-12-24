import { BasicRankPanel } from "./BasicRankPanel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { IconBtn } from "../baseView/mobile/icon.btn";

export class RankPanel extends BasicRankPanel {
    private static ZoomSize: number[] = [30, 362];
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mCurrentIndex: number;
    private mClsBtn: IconBtn;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public resize() {
        if (!this.mWorld) {
            return;
        }
        const size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width - this.width - 150;
            this.y = 21;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width - this.mWidth * this.mWorld.uiScale >> 1;
                this.y = size.height - this.mHeight * this.mWorld.uiScale >> 1;
            } else {
                this.x = size.width - this.mWidth * this.mWorld.uiScale >> 1;
                this.y = size.height - this.mHeight * this.mWorld.uiScale >> 1;
            }
        }
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public destroy() {
        if (this.mZoonInBtn) this.mZoonInBtn.destroy(true);
        this.mZoonInBtn = null;
        this.mCurrentIndex = 0;
        super.destroy();
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
        this.mClsBtn = new IconBtn(this.mScene, this.mWorld, "clsBtn", ["btn_normal", "btn_over", "btn_click"], "", 1);
        this.mClsBtn.x = this.mWidth - 35;
        this.mClsBtn.y = 0;
        this.mClsBtn.on("pointerup", this.hide, this);
        this.add(this.mClsBtn);
        // this.mZoonInBtn = this.mScene.make.image()
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) {
            const items = this.getData("data");
            if (items) this.addItem(items);
        }
    }

    private onZoomHandler() {
        this.currentSizeIndex = this.mCurrentIndex === 0 ? 1 : 0;
    }

    private set currentSizeIndex(value: number) {
        if (this.mCurrentIndex === value) {
            return;
        }
        this.mCurrentIndex = value;
        const h = RankPanel.ZoomSize[this.mCurrentIndex];
        this.mBackground.resize(328, h);
        if (h > 300) {
            this.add(this.mContentContainer);
            this.mZoonInBtn.angle = 180;
        } else {
            this.mZoonInBtn.angle = 0;
            this.remove(this.mContentContainer);
        }
        this.mBackground.x = this.mBackground.width >> 1;
        this.mBackground.y = this.mBackground.height >> 1;
        this.mZoonInBtn.y = h - 13;
    }
}
