
import { op_client } from "pixelpai_proto";
import { Button, ClickEvent, UIType } from "apowophaserui";
import { DynamicImage, ImageValue, ThreeSliceButton, ThreeSlicePath } from "gamecoreRender";
import { AvatarSuit, AvatarSuitType, ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper, Url } from "utils";
export class PicaOnlineBottomPanel extends Phaser.GameObjects.Container {
    public roleData: any;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private bg: ThreeSlicePath;
    private headIcon: DynamicImage;
    private content: Phaser.GameObjects.Container;
    private nameText: Phaser.GameObjects.Text;
    private reportBtn: ThreeSliceButton;
    private blackBtn: ThreeSliceButton;
    private sendHandler: Handler;
    private isblack: boolean = false;

    constructor(scene: Phaser.Scene, width: number, height: number, private key: string, private dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.setInteractive();
        this.init();
    }
    init() {
        const conWdith = this.width;
        const conHeight = 69 * this.dpr;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0.66);
        this.blackGraphic.fillRect(0, 0, this.width, this.height);
        this.blackGraphic.x = -this.width * 0.5;
        this.blackGraphic.y = -this.height * 0.5;
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new ThreeSlicePath(this.scene, 0, 0, conWdith, 87 * this.dpr, this.key,
            ["people_panel_bg_left", "people_panel_bg_middle", "people_panel_bg_right"], this.dpr);
        this.bg.y = conHeight * 0.5 - this.bg.height * 0.5 + 18 * this.dpr;
        this.content.add(this.bg);
        this.headIcon = new DynamicImage(this.scene, 0, 0);
        this.headIcon.x = -conWdith * 0.5 + 40 * this.dpr;
        this.headIcon.y = 0 * this.dpr;
        this.headIcon.scale = this.dpr;
        this.headIcon.visible = false;
        this.content.add(this.headIcon);

        this.nameText = this.scene.make.text({ x: -conWdith * 0.5 + 96 * this.dpr, y: -conHeight * 0.5 + 15 * this.dpr, text: "", style: UIHelper.whiteStyle(this.dpr, 14) });
        this.nameText.setFontStyle("bold");
        this.nameText.setOrigin(0, 0.5);
        this.content.add(this.nameText);
        const fnormals = ["butt_yellow_left_s", "butt_yellow_middle_s", "butt_yellow_right_s"];
        this.reportBtn = new ThreeSliceButton(this.scene, 84 * this.dpr, 31 * this.dpr, this.key, fnormals, fnormals, i18n.t("player_info.report"));
        this.reportBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.reportBtn.y = conHeight * 0.5 - this.reportBtn.height * 0.5 - 5 * this.dpr;
        this.reportBtn.x = this.reportBtn.width * 0.5 + 20 * this.dpr;
        this.reportBtn.on(ClickEvent.Tap, this.onReportHandler, this);
        this.content.add(this.reportBtn);
        const tnormals = ["butt_red_left_s", "butt_red_middle_s", "butt_red_right_s"];
        this.blackBtn = new ThreeSliceButton(this.scene, 84 * this.dpr, 31 * this.dpr, this.key, tnormals, tnormals, i18n.t("player_info.blockuer"));
        this.blackBtn.setTextStyle(UIHelper.whiteStyle(this.dpr));
        this.blackBtn.y = this.reportBtn.y;
        this.blackBtn.x = -this.blackBtn.width * 0.5 - 5 * this.dpr;
        this.blackBtn.on(ClickEvent.Tap, this.onBlockHandler, this);
        this.content.add(this.blackBtn);

        this.content.x = 0;
        this.content.y = this.height * 0.5 + this.content.height * 0.5 + 10 * this.dpr;
        this.content.setInteractive();
    }

    public setRoleData(data: any, isblock: boolean) {
        this.roleData = data;
        this.isblack = isblock;
        if (!this.roleData) return;
        this.headIcon.visible = false;
        this.nameText.text = data.nickname;
        if (data.avatar) {
            const url = Url.getOsdRes(data["avatar"]);
            this.headIcon.load(url, this, () => {
                this.headIcon.visible = true;
            });
        }
        this.blackBtn.setText(isblock ? i18n.t("player_info.remove_black") : i18n.t("player_info.blockuer"));
    }

    public refreshBlack(isblack: boolean) {
        this.setRoleData(this.roleData, isblack);
    }

    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }

    public addListen() {
        this.reportBtn.on(ClickEvent.Tap, this.onReportHandler, this);
        this.blackBtn.on(ClickEvent.Tap, this.onBlockHandler, this);
        this.on("pointerdown", this.onCloseHandler, this);
    }

    public removeListen() {
        this.reportBtn.off(ClickEvent.Tap, this.onReportHandler, this);
        this.blackBtn.off(ClickEvent.Tap, this.onBlockHandler, this);
        this.off("pointerdown", this.onCloseHandler, this);
    }

    public show() {
        this.addListen();
        this.visible = true;
        const tempy = this.height * 0.5 + this.content.height * 0.5 + 10 * this.dpr;
        this.content.y = tempy;
        const fromy = tempy;
        const toy = this.height * 0.5 - this.content.height * 0.5;
        this.playMove(fromy, toy);
    }

    public hide() {
        this.removeListen();
        this.visible = false;
    }

    private playMove(from: number, to: number) {
        const tween = this.scene.tweens.add({
            targets: this.content,
            y: {
                from,
                to
            },
            ease: "Linear",
            duration: 150,
            onComplete: () => {
                tween.stop();
                tween.remove();
            },
        });
    }

    private onReportHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["report"]);
    }

    private onBlockHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["block", { uid: this.roleData.platformId, black: !this.isblack }]);
    }

    private onCloseHandler() {
        this.hide();
        if (this.sendHandler) this.sendHandler.runWith(["close"]);
    }
}
