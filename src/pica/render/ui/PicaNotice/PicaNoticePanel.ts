import { BBCodeText, NineSlicePatch } from "apowophaserui";
import { BasePanel, DynamicImage, MainUIScene, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, Url } from "utils";

export class PicaNoticePanel extends BasePanel {
    private mContent: BBCodeText;
    private isbigbg: boolean = false;
    private bg: Phaser.GameObjects.Image;
    private imageIcon: DynamicImage;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICANOTICE_NAME;
    }

    show(param: any[]) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI
        this.mShowData = param;
        if (param && param.length > 0) {
            if (param[0].display && param[0].display.length > 0) this.isbigbg = true;
        }
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (param && param.length > 0) {
            const text = param[0].text;
            if (this.mContent && text && text.length > 0) {
                this.mContent.setText(text[0].text);
                if (this.isbigbg)
                    this.mContent.y = -this.bg.height * 0.5 + this.mContent.height * 0.5 + 2 * this.dpr;
            }
            const display = param[0].display;
            if (this.imageIcon && display && display.length > 0) {
                const url = Url.getOsdRes(display[0].texturePath);
                this.imageIcon.load(url, this, () => {
                    this.imageIcon.scale = this.dpr;
                    if (this.mContent && this.mContent.text !== "")
                        this.imageIcon.y = this.bg.height * 0.5 - this.imageIcon.displayHeight * 0.5 - 2 * this.dpr;
                });
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
                    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_close");
                }
            });
        }
    }

    public resize() {
        this.x = this.scene.cameras.main.width / 2;
        this.y = 170 * this.dpr;
    }

    protected preload() {
        const url = this.isbigbg ? "pica_notice/bg_big.png" : "pica_notice/bg.png";
        const key = this.isbigbg ? "pica_notice_bg_big" : "pica_notice_bg";
        this.addImage(key, url);
        super.preload();
    }

    protected init() {
        const key = this.isbigbg ? "pica_notice_bg_big" : "pica_notice_bg";
        this.bg = this.scene.make.image({
            key
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
                width: this.bg.width * this.scale - 12 * this.dpr
            }
        }).setOrigin(0.5, 0.5);
        this.mContent.setFontStyle("bold");
        this.add([this.bg, this.mContent]);
        if (this.isbigbg) {
            this.imageIcon = new DynamicImage(this.scene, 0, 0);
            this.add(this.imageIcon);
        }

        (<MainUIScene>this.mScene).layerManager.addToLayer(MainUIScene.LAYER_TOOLTIPS, this);

        super.init();

        this.resize();
    }
}
