import { op_client, op_pkt_def } from "pixelpai_proto";
import { ThreeSliceButton, ToggleColorButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaMailMainPanel } from "./PicaMailMainPanel";
import { ClickEvent } from "apowophaserui";
export class PicaMailPanel extends PicaBasePanel {
    public static PICAMAIL_CLOSE: string = "PICAMAIL_CLOSE";
    public static PICAMAIL_DATA: string = "PICAMAIL_DATA";
    public mainPanel: PicaMailMainPanel;
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Graphics;
    private tilteName: Phaser.GameObjects.Text;
    private oneKeyBtn: ThreeSliceButton;
    private content: Phaser.GameObjects.Container;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAMAIL_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.mail];
    }
    public hide() {
        this.render.emitter.emit(PicaMailPanel.PICAMAIL_CLOSE);
        super.hide();
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRect(-this.x, -this.y, w, h);
        this.bg.clear();
        this.bg.fillStyle(0, 0.6);
        this.bg.fillRect(0, 0, this.content.width, h);
        this.bg.x = -this.content.width * 0.5;
        this.bg.y = -this.content.height * 0.5;
        this.content.x = this.width + this.content.width * 0.5 + 10 * this.dpr;
        this.content.y = h * 0.5;
        this.blackBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mainPanel.refreshMask();
    }

    onShow() {
        if (this.tempDatas) this.setMailDatas(this.tempDatas);
    }
    public addListen() {
        if (!this.mInitialized) return;
        this.blackBg.on("pointerup", this.onClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.blackBg.off("pointerup", this.onClosePanel, this);
    }
    init() {
        this.setSize(this.scaleWidth, this.scaleHeight);
        this.blackBg = this.scene.make.graphics(undefined, false);
        const conWidth = 300 * this.dpr;
        const conHeight = this.height;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        this.content.setInteractive();
        this.add([this.blackBg, this.content]);
        this.bg = this.scene.make.graphics(undefined, false);
        this.tilteName = this.scene.make.text({ text: i18n.t("mail.title"), style: UIHelper.whiteStyle(this.dpr, 18) });
        this.tilteName.setOrigin(0, 0.5);
        this.tilteName.setFontStyle("bold");
        this.tilteName.x = -conWidth * 0.5 + 20 * this.dpr;
        this.tilteName.y = -conHeight * 0.5 + 40 * this.dpr;
        this.oneKeyBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("mail.onekey"));
        this.oneKeyBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.oneKeyBtn.setFontStyle("bold");
        this.oneKeyBtn.x = conWidth * 0.5 - this.oneKeyBtn.width * 0.5 - 10 * this.dpr;
        this.oneKeyBtn.y = this.tilteName.y;
        this.oneKeyBtn.on(ClickEvent.Tap, this.onAllReceiveHandler, this);
        const mainHeight = this.height * 0.5 - this.oneKeyBtn.y - this.oneKeyBtn.height * 0.5 - 20 * this.dpr;
        this.mainPanel = new PicaMailMainPanel(this.scene, this.content.width, mainHeight, this.dpr, this.scale, this.render);
        this.mainPanel.setHandler(new Handler(this, this.onMainPanelHandler));
        this.mainPanel.y = this.height * 0.5 - mainHeight * 0.5;
        this.content.add([this.bg, this.oneKeyBtn, this.tilteName, this.mainPanel]);
        this.resize();
        super.init();
        this.playMove();
    }

    setMailDatas(content: any) {
        this.tempDatas = content;
        if (!this.mInitialized) return;
        this.mainPanel.setMailDatas(content);
    }

    private onAllReceiveHandler() {
        this.render.renderEmitter(ModuleName.PICAMAIL_NAME + "_allrewards");
    }
    private onMainPanelHandler(tag: string, data?: any) {
        if (tag === "readmail") {
            this.render.renderEmitter(ModuleName.PICAMAIL_NAME + "_readmail", data);
        } else if (tag === "getrewards") {
            this.render.renderEmitter(ModuleName.PICAMAIL_NAME + "_getrewards", data);
        }
    }
    private onClosePanel() {
        this.render.renderEmitter(ModuleName.PICAMAIL_NAME + "_hide");
    }

    private playMove() {
        const from = this.width + this.content.width * 0.5 + 10 * this.dpr;
        const to = this.width - this.content.width * 0.5;
        const tween = this.scene.tweens.add({
            targets: this.content,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.mainPanel.refreshMask();
            },
        });
    }
}
