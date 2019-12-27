import { BasicRankPanel } from "./BasicRankPanel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { IconBtn } from "../baseView/mobile/icon.btn";
import { Size } from "../../utils/size";
import { RankMediator } from "./RankMediator";

export class RankPanel extends BasicRankPanel {
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mCurrentIndex: number = 0;
    private mClsBtn: IconBtn;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public resize(wid: number = 0, hei: number = 0) {
        if (!this.mWorld) {
            return;
        }
        const size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width - this.mWidth / 2;
            this.y = this.mHeight / 2 + 10;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width + wid >> 1;
                this.y = size.height + hei >> 1;
            } else {
                this.x = size.width + wid >> 1;
                this.y = size.height + hei >> 1;
            }
        }
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public tweenView(show: boolean) {
        if (!this.mScene) return;
        const baseY: number = this.mHeight / 2 + 10;
        const toY: number = show === true ? baseY : baseY - 300;
        const toAlpha: number = show === true ? 1 : 0;
        this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Cubic.Out",
            props: {
                y: { value: toY },
                alpha: { value: toAlpha },
            },
        });
    }

    public destroy() {
        if (this.mZoonInBtn) this.mZoonInBtn.destroy(true);
        this.mZoonInBtn = null;
        this.mCurrentIndex = 0;
        super.destroy();
    }

    protected init() {
        super.init();
        if (!this.mWorld.game.device.os.desktop) {
            this.mClsBtn = new IconBtn(this.mScene, this.mWorld, "clsBtn", ["btn_normal", "btn_over", "btn_click"], "", 1);
            this.mClsBtn.x = this.mWidth / 2 - 35;
            this.mClsBtn.y = -this.mHeight / 2;
            this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
            this.mClsBtn.on("pointerup", this.closeHandler, this);
            this.add(this.mClsBtn);
        } else {
            this.mZoonInBtn = this.scene.make.image({
                x: 0,
                y: this.mHeight / 2 - 10,
                key: "rank_atlas",
                frame: "arrow.png"
            }, false);
            this.add(this.mZoonInBtn);
            this.mZoonInBtn.setInteractive();
            this.mZoonInBtn.on("pointerup", this.onZoomHandler, this);
        }
        this.resize();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) {
            const items = this.getData("data");
            if (items) this.addItem(items);
        }
    }

    private closeHandler() {
        const med: RankMediator = this.mWorld.uiManager.getMediator(RankMediator.NAME) as RankMediator;
        med.hide();
    }

    private onZoomHandler() {
        this.currentSizeIndex = this.mCurrentIndex === 0 ? 1 : 0;
    }

    private set currentSizeIndex(value: number) {
        if (this.mCurrentIndex === value) {
            return;
        }
        this.mCurrentIndex = value;
        const h = this.mCurrentIndex === 1 ? 30 : this.mHeight;
        const zoonBtnY: number = this.mCurrentIndex === 1 ? -this.mHeight / 2 + 20 : this.mHeight / 2 - 10;
        const bgY: number = this.mCurrentIndex === 1 ? -this.mHeight / 2 + 15 : 0;
        this.mBackground.resize(328, h);
        this.mZoonInBtn.angle = this.mCurrentIndex === 1 ? 180 : 0;
        if (h > 300) {
            this.add(this.mContentContainer);
        } else {
            this.remove(this.mContentContainer);
        }
        // this.mBackground.x = this.mBackground.width >> 1;
        // this.mBackground.y = this.mBackground.height >> 1;
        this.mBackground.y = bgY;
        this.mZoonInBtn.y = zoonBtnY;
    }
}
