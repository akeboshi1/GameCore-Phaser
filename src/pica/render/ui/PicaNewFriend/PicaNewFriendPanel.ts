import { ButtonEventDispatcher, DynamicImage, ToggleColorButton, UiManager } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Handler, i18n, UIHelper, Url } from "utils";
import { op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { ImageValue } from "..";
export class PicaNewFriendPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBlack: Phaser.GameObjects.Graphics;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private peopleImg: ImageValue;
    private toggleCon: Phaser.GameObjects.Container;
    private optionLine: Phaser.GameObjects.Image;
    private selectLine: Phaser.GameObjects.Image;
    private curToggleItem: ToggleColorButton;
    private toggleItems: ToggleColorButton[] = [];
    private people: number;
    private optionType: number;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAONLINE_NAME;
        this.atlasNames = [UIAtlasName.uicommon];
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.mBackground.clear();
        this.mBackground.fillStyle(0x01CDFF, 1);
        this.mBackground.fillRect(0, 0, this.content.width, height);
        this.mBackground.x = -this.content.width * 0.5;
        this.mBackground.y = -height * 0.5;
        this.content.x = width + this.content.width * 0.5 + 10 * this.dpr;
        this.content.y = height * 0.5;
        this.setSize(width, height);
    }

    protected onInitialized() {
        if (this.people) this.peopleImg.setText(this.people + "");
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.mBlack = this.scene.make.graphics(undefined, false);
        this.mBlack.fillStyle(0, 0.66);
        this.mBlack.fillRect(0, 0, w, h);
        this.mBlack.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mBlack.on("pointerup", this.onCloseHandler, this);
        this.add(this.mBlack);
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 237 * this.dpr;
        this.content.setSize(bgwidth, h);
        this.content.setInteractive();
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_bg" });
        this.bg.displayWidth = bgwidth;
        this.bg.y = -h * 0.5 + this.bg.height * 0.5;
        this.titleTex = this.scene.make.text({ x: 0, y: 0, text: i18n.t("friendlist.title"), style: UIHelper.whiteStyle(this.dpr, 18) }).setOrigin(0, 0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.x = -this.content.width * 0.5 + 10 * this.dpr;
        this.titleTex.y = -this.content.height * 0.5 + 35 * this.dpr;
        this.peopleImg = new ImageValue(this.scene, 50 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "online_people", this.dpr);
        this.peopleImg.setOffset(-this.dpr, 0);
        this.peopleImg.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.peopleImg.setLayout(3);
        this.peopleImg.setText("1000");
        this.peopleImg.x = this.content.width * 0.5 - 30 * this.dpr;
        this.peopleImg.y = this.titleTex.y;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.toggleCon.y = this.peopleImg.y + this.peopleImg.height * 0.5 + 20 * this.dpr;
        this.add(this.toggleCon);
        this.optionLine = this.scene.make.image({ key: UIAtlasName.map, frame: "map_nav_line" });
        this.optionLine.displayHeight = 2 * this.dpr;
        this.selectLine = this.scene.make.image({ key: UIAtlasName.map, frame: "map_nav_select" });
        this.toggleCon.add([this.optionLine, this.selectLine]);
        this.content.add([this.mBackground, this.bg, this.titleTex, this.peopleImg]);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.playMove();
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("friendlist.friends"), type: 2 }, { text: i18n.t("friendlist.fans"), type: 1 }, { text: i18n.t("friendlist.follow"), type: 3 }];
        const allLin = 272 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text);
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.toggleCon.add(item);
            item.setChangeColor("#FFF449");
            item.setFontSize(14 * this.dpr);
            posx += cellwidth;
            this.toggleItems.push(item);
        }
        this.optionLine.y = 20 * this.dpr;
        this.selectLine.y = this.optionLine.y;
    }
    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggleItem === toggle) return;
        if (this.curToggleItem) this.curToggleItem.isOn = false;
        this.curToggleItem = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        toggle.isOn = true;
        if (this.optionType !== 2 && this.optionType !== 3) {
            this.render.renderEmitter(this.key + "_getnavigatelist", this.optionType);
        } else if (this.optionType === 2) {
            this.render.renderEmitter(this.key + "_getRoomList", { page: 1, perPage: 100 });
        } else if (this.optionType === 3) {
            this.render.renderEmitter(this.key + "_getMyRoomList");
        }
    }
    private playMove() {
        const width = this.scaleWidth;
        const from = width + this.content.width * 0.5 + 10 * this.dpr;
        const to = width - this.content.width * 0.5;
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
            },
        });
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
}
