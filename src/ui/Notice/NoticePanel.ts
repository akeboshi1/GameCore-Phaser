import { Panel } from "../components/panel";
import { Border } from "../../utils/resUtil";
import { op_client } from "pixelpai_proto";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";

export class NoticePanel extends Panel {
    private mContentText: Phaser.GameObjects.Text;
    private mTween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public show(param?: any) {
        super.show(param);
        this.setData("data", param);
        this.resize();
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

    public resize() {
        const view = this.scene.cameras.main.worldView;
        this.x = view.x + view.width >> 1;
        this.y = 180;
    }

    public showNotice(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_NOTICE) {
        if (!this.mInitialized) return;
        if (!data) return;

        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
        }
        const setting = data.chatsetting;
        this.mContentText.setText(data.noticeContext);
        this.mContentText.setFill(setting.textColor ? setting.textColor : "#FFFFFF");
        this.mContentText.x = -(this.mContentText.width >> 1);
        this.mContentText.y = -(this.mContentText.height >> 1);

        this.mTween = this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200
        });

        const delay = setting.duration ? setting.duration : 5000;
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
        const background = new NinePatch(this.scene, 0, 0, 1200, 120, Border.getName(), null, Border.getConfig());
        this.add(background);

        this.mContentText = this.scene.make.text({
            align: "center",
            style: { font: Font.YAHEI_20_BOLD, wordWrap: { width: 1180, useAdvancedWrap: true } }
        }, false)
            .setStroke("#000000", 1);
        this.add(this.mContentText);
        super.init();

        const data = this.getData("data");
        if (data) {
            this.showNotice(data);
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
    }
}
