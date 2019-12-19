import { BasicRankPanel } from "./BasicRankPanel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";

export class RankPanel extends BasicRankPanel {
    private static ZoomSize: number[] = [30, 362];
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mCurrentIndex: number;
    private mClsBtnSprite: Phaser.GameObjects.Sprite;
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
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            } else {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            }
        }
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
        if (!this.mWorld.game.device.os.desktop) {
            if (!this.mScene.textures.exists("clsBtn")) {
                this.mScene.load.spritesheet("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 });
                this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onClsLoadCompleteHandler, this);
                this.mScene.load.start();
            } else {
                this.onClsLoadCompleteHandler();
            }
        }
        // this.mZoonInBtn = this.mScene.make.image()
    }


    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) {
            const items = this.getData("data");
            if (items) this.addItem(items);
        }
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.mWidth >> 1) - 65;
        this.mClsBtnSprite.y = (-this.mHeight >> 1);
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.closeHandler, this);
        this.add(this.mClsBtnSprite);
    }

    private closeHandler() {
        this.hide();
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
