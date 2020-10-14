import { BasicRankPanel } from "./BasicRankPanel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { IconBtn } from "../baseView/icon.btn";
import { Size } from "../../utils/size";
import { RankMediator } from "./RankMediator";
import { UIMediatorType } from "../ui.mediatorType";

export class RankPanel extends BasicRankPanel {
    private mZoonInBtn: Phaser.GameObjects.Image;
    private mCurrentIndex: number = 0;
    private mClsBtn: IconBtn;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public addListen() {
        if (!this.mInitialized) return;
        if (!this.mWorld.game.device.os.desktop) {
            this.mClsBtn.on("pointerup", this.closeHandler, this);
        } else {
            this.mZoonInBtn.on("pointerup", this.onZoomHandler, this);
        }
    }

    public removeListen() {
        if (!this.mInitialized) return;
        if (!this.mWorld.game.device.os.desktop) {
            this.mClsBtn.off("pointerup", this.closeHandler, this);
        } else {
            this.mZoonInBtn.off("pointerup", this.onZoomHandler, this);
        }
    }

    public resize(wid: number = 0, hei: number = 0) {
        if (!this.mWorld) {
            return;
        }
        const size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width - this.width / 2;
            this.y = this.height / 2 + 10;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width + wid >> 1;
                this.y = size.height + hei >> 1;
            } else {
                this.x = size.width + wid >> 1;
                this.y = size.height + hei >> 1;
            }
        }
        this.scale = this.mWorld.uiScale;
    }

    public tweenView(show: boolean) {
        if (!this.scene) return;
        const baseY: number = this.height / 2 + 10;
        const toY: number = show === true ? baseY : baseY - 300;
        const toAlpha: number = show === true ? 1 : 0;
        this.scene.tweens.add({
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
            this.mClsBtn = new IconBtn(this.scene, this.mWorld, {
                key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
                iconResKey: "", iconTexture: "", scale: 1, pngUrl: "ui/common/common_clsBtn.png", jsonUrl: "ui/common/common_clsBtn.json"
            });
            this.mClsBtn.x = this.width / 2 - 35;
            this.mClsBtn.y = -this.height / 2;
            this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
            // this.mClsBtn.on("pointerup", this.closeHandler, this);
            this.add(this.mClsBtn);
        } else {
            this.mZoonInBtn = this.scene.make.image({
                x: 0,
                y: this.height / 2 - 10,
                key: "rank_atlas",
                frame: "arrow.png"
            }, false);
            this.add(this.mZoonInBtn);
            this.mZoonInBtn.setInteractive();
            // this.mZoonInBtn.on("pointerup", this.onZoomHandler, this);
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
        const h = this.mCurrentIndex === 1 ? 30 : this.height;
        const zoonBtnY: number = this.mCurrentIndex === 1 ? -this.height / 2 + 20 : this.height / 2 - 10;
        const bgY: number = this.mCurrentIndex === 1 ? -this.height / 2 + 15 : 0;
        this.mBackground.resize(328, h);
        this.mZoonInBtn.angle = this.mCurrentIndex === 1 ? 180 : 0;
        if (h > 300) {
            if (this.parentContainer)
                this.add(this.mChildContainer);
        } else {
            this.remove(this.mChildContainer);
        }
        // this.mBackground.x = this.mBackground.width >> 1;
        // this.mBackground.y = this.mBackground.height >> 1;
        this.mBackground.y = bgY;
        this.mZoonInBtn.y = zoonBtnY;
    }
}
