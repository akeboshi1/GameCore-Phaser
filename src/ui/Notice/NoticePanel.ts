import { BasePanel } from "../components/BasePanel";
import { Border } from "../../utils/resUtil";
import { op_client } from "pixelpai_proto";
import { Font } from "../../utils/font";
import { NinePatch } from "apowophaserui";
import { WorldService } from "../../game/world.service";

export class NoticePanel extends BasePanel {
    private mContentText: Phaser.GameObjects.Text;
    private mTween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public show(param?: any) {
        super.show(param);
        this.resize();
        this.scale = this.mWorld.uiRatio;
        this.refreshData();
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    public destroy() {
        if (this.mContentText) {
            this.mContentText.destroy();
            this.mContentText = null;
        }
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = null;
        }
        super.destroy();
    }

    public resize(wid: number = 0, hei: number = 0) {
        const view = this.scene.cameras.main.worldView;
        this.x = view.x + view.width + wid >> 1;
        this.y = 180 + hei;
    }

    public showNotice(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_NOTICE) {
        if (!this.mInitialized) return;
        if (!data) return;

        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
        }
        let color = "#FFFFFF";
        let delay = 5000;
        const setting = data.chatsetting;
        if (setting) {
            if (setting.textColor) {
                color = setting.textColor;
            }
            if (setting.duration) {
                delay = setting.duration;
            }
        }
        this.mContentText.setText(data.noticeContext);
        this.mContentText.setFill(color);
        this.mContentText.x = -(this.mContentText.width >> 1);
        this.mContentText.y = -(this.mContentText.height >> 1);

        this.mTween = this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            delay,
            onComplete: () => {
                this.removeFromParent();
            }
        });
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        super.preload();
    }

    protected init() {
        // const background = new NinePatch(this.scene, {
        //     width: 1200,
        //     height: 120,
        //     key: Border.getName(),
        //     columns: Border.getColumns(),
        //     rows: Border.getRows()
        // });
        const background = new NinePatch(this.scene, 0, 0, 1200, 120, Border.getName(), null, undefined, undefined, Border.getConfig());
        this.add(background);

        this.mContentText = this.scene.make.text({
            align: "center",
            style: {
                fontFamily: "bold YaHei",
                fontSize: 20 * this.dpr * this.mWorld.uiScale,
                wordWrap: { width: 1180, useAdvancedWrap: true },
            },
        }, false)
            .setStroke("#000000", 1);
        this.add(this.mContentText);
        super.init();
    }

    private refreshData() {
        const data = this.mShowData;
        if (data) {
            this.showNotice(<any>data);
        }
    }

    private removeFromParent() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = null;
        }
        this.mShow = false;
    }
}
