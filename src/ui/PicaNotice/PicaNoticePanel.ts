import { WorldService } from "../../game/world.service";
import { BasePanel } from "../components/BasePanel";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { BBCodeText } from "apowophaserui";

export class PicaNoticePanel extends BasePanel {
    private mContent: BBCodeText;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    show(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI[]) {
        this.mShowData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (param && param.length > 0) {
            const text = param[0].text;
            if (this.mContent) {
              this.mContent.setText(text[0].text);
            }

            const width = this.scene.cameras.main.width;
            // this.view.alpha = 0;
            this.scene.tweens.timeline({
              targets: this,
              duration: 500,
              tweens: [{
                  y: `-=${20 * this.dpr}`,
                  ease: "Bounce.easeOut",
              }, {
                delay: 2000,
                y: `-=${20 * this.dpr}`,
                ease: "Linear",
                alpha: 0
              }],
              onComplete: () => {
                this.emit("close");
              }
            });
        }
    }

    public resize() {
        this.x = this.scene.cameras.main.width / 2;
        this.y = 170 * this.dpr;
    }

    protected preload() {
        this.addImage("pica_notice_bg", "pica_notice/bg.png");
        super.preload();
    }

    protected init() {
        const bg = this.scene.make.image({
            key: "pica_notice_bg"
        }, false);

        this.mContent = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: 16 * this.dpr + "px",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#000000",
            strokeThickness: 1 * this.dpr,
            align: "center",
            textMask: false,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: "#000",
                blur: 4,
                stroke: true,
                fill: true
            },
            wrap: {
                mode: "char",
                width: bg.width * this.scale - 12 * this.dpr
            }
        }).setOrigin(0.5, 0.5);
        this.mContent.setFontStyle("bold");
        this.add([bg, this.mContent]);

        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);

        super.init();

        this.resize();
    }
}
