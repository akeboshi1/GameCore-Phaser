import { ButtonEventDispatcher, DynamicImage, ImageValue, UiManager } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { PicaOnlineBottomPanel } from "./PicaOnlineBottomPanel";
export class PicaOnlinePanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBlack: Phaser.GameObjects.Graphics;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private peopleImg: ImageValue;
    private mGameGrid: GameGridTable;
    private bottomPanel: PicaOnlineBottomPanel;
    private userid: string;
    private blackList: string[];
    private onlineData: any;
    private people: number;
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
        this.bottomPanel.x = width * 0.5;
        this.bottomPanel.y = height * 0.5;
        this.setSize(width, height);
    }

    public addListen() {
        if (!this.mInitialized) return;

    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    public destroy() {
        this.removeListen();
        super.destroy();
    }

    public setOnlineDatas(datas: op_pkt_def.PKT_PlayerInfo[], people: number, userid: string) {
        this.onlineData = datas;
        this.userid = userid;
        this.people = people;
        if (!this.mInitialized) return;
        this.peopleImg.setText(people + "");
        this.mGameGrid.setItems(datas);
    }

    public setBlackList(blacklist: string[]) {
        this.blackList = blacklist;
        if (!this.mInitialized) return;
        this.refreshBottomPanel();
    }

    public setAvatarList(avatars: any) {
        for (const player of this.onlineData) {
            for (const data of avatars) {
                const id = data._id;
                const avatar = data.avatar;
                if (player.platformId === id) {
                    player.avatar = avatar;
                }
            }
        }
        if (!this.mInitialized) return;
        this.mGameGrid.refresh();
    }

    protected onInitialized() {
        if (this.onlineData) this.mGameGrid.setItems(this.onlineData);
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
        this.mBlack.on("pointerdown", this.onCloseHandler, this);
        this.add(this.mBlack);
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 237 * this.dpr;
        this.content.setSize(bgwidth, h);
        this.content.setInteractive();
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_bg" });
        this.bg.displayWidth = bgwidth;
        this.bg.y = -h * 0.5 + this.bg.height * 0.5;
        this.titleTex = this.scene.make.text({ x: 0, y: 0, text: i18n.t("online.title"), style: UIHelper.whiteStyle(this.dpr, 18) }).setOrigin(0, 0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.x = -this.content.width * 0.5 + 10 * this.dpr;
        this.titleTex.y = -this.content.height * 0.5 + 20 * this.dpr;
        this.peopleImg = new ImageValue(this.scene, 50 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "online_people", this.dpr);
        this.peopleImg.setOffset(-this.dpr, 0);
        this.peopleImg.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.peopleImg.setLayout(3);
        this.peopleImg.setText("1000");
        this.peopleImg.x = this.content.width * 0.5 - 30 * this.dpr;
        this.peopleImg.y = this.titleTex.y;
        const simpleHandler = new Handler(this, this.onSimpleHandler);
        const tableConfig = {
            x: 0,
            y: 25 * this.dpr,
            table: {
                width: bgwidth,
                height: h - 40 * this.dpr,
                columns: 1,
                cellWidth: bgwidth,
                cellHeight: 50 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new OnlineItem(this.scene, UIAtlasName.uicommon, this.dpr);
                    cellContainer.setHandler(simpleHandler);
                }
                cellContainer.setPlayerInfo(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.content.add([this.mBackground, this.bg, this.titleTex, this.peopleImg, this.mGameGrid]);
        this.add(this.content);
        this.bottomPanel = new PicaOnlineBottomPanel(this.scene, w, h, UIAtlasName.uicommon, this.dpr);
        this.bottomPanel.setHandler(new Handler(this, this.onBottomPanelHandler));
        this.add(this.bottomPanel);
        this.bottomPanel.visible = false;
        this.resize(0, 0);
        super.init();
        this.playMove();
    }

    private onGridTableHandler(item) {
        const playerData = item.playerData;
        this.render.renderEmitter(this.key + "_openingcharacter", playerData.platformId);
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
                this.mGameGrid.resetMask();
            },
        });
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }

    private onSimpleHandler(data: any) {
        if (data.platformId === this.userid) {
            this.render.renderEmitter(this.key + "_openingcharacter", data.platformId);
        } else {
            this.add(this.bottomPanel);
            this.bottomPanel.show();
            const black = this.blackList.indexOf(data.platformId) !== -1;
            this.bottomPanel.setRoleData(data, black);
        }
    }

    private refreshBottomPanel() {
        if (this.bottomPanel.visible) {
            const platformId = this.bottomPanel.roleData.platformId;
            const black = this.blackList.indexOf(platformId) !== -1;
            this.bottomPanel.refreshBlack(black);
        }
    }

    private onBottomPanelHandler(tag: string, data: any) {
        if (tag === "report") {

        } else if (tag === "block") {
            this.render.renderEmitter(this.key + "_block", data);
        } else if (tag === "close") {
            this.closeBottomPanel();
        }
    }

    private closeBottomPanel() {
        this.bottomPanel.hide();
        this.remove(this.bottomPanel);
    }

}
class OnlineItem extends ButtonEventDispatcher {
    public playerData: any;// op_client.IEditModeRoom
    protected key: string;
    protected dpr: number;
    private headicon: DynamicImage;
    private nameImage: ImageValue;
    private levelLabel: Phaser.GameObjects.Text;
    private vipImage: ImageValue;
    private line: Phaser.GameObjects.Image;
    private simpleButton: Button;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene, 0, 0);
        this.key = key;
        this.dpr = dpr;
        this.setSize(237 * dpr, 48 * dpr);
        this.headicon = new DynamicImage(this.scene, 0, 0);
        this.headicon.x = -this.width * 0.5 + 10 * this.dpr;
        this.headicon.y = 0;
        this.headicon.scale = this.dpr * 0.8;
        this.headicon.visible = false;
        this.add(this.headicon);
        this.nameImage = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, this.key, "people_woman", this.dpr);
        this.nameImage.setOffset(-this.dpr, 0);
        this.nameImage.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.nameImage.setLayout(1);
        this.nameImage.setText("");
        this.nameImage.x = this.headicon.x + 70 * this.dpr;
        this.nameImage.y = -this.height * 0.5 + 15 * this.dpr;
        this.add(this.nameImage);
        this.levelLabel = this.scene.make.text({ x: this.nameImage.x - 8 * this.dpr, y: this.nameImage.y + 20 * this.dpr, text: "", style: UIHelper.whiteStyle(this.dpr) });
        this.levelLabel.setOrigin(0, 0.5);
        this.add(this.levelLabel);

        this.vipImage = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, this.key, "people_woman", this.dpr);
        this.vipImage.setOffset(-this.dpr, 0);
        this.vipImage.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.vipImage.setLayout(1);
        this.vipImage.setText("");
        this.vipImage.x = this.levelLabel.x + 70 * this.dpr;
        this.vipImage.y = -this.width * 0.5 + 15 * this.dpr;
        // this.add(this.vipImage);
        this.line = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_divider" });
        this.line.y = this.height * 0.5;
        this.add(this.line);
        this.simpleButton = new Button(this.scene, this.key, "online_more");
        this.simpleButton.on(ClickEvent.Tap, this.onSimpleClickHandler, this);
        this.simpleButton.x = this.width * 0.5 - this.simpleButton.width * 0.5 - 10 * dpr;
        // this.simpleButton.setSize(60 * this.dpr, 20 * this.dpr);
        // this.simpleButton.removeInteractive();
        // this.simpleButton.setInteractive();
        // this.simpleButton["setInteractiveSize"](60 * this.dpr, 20 * this.dpr);
        this.add(this.simpleButton);
    }
    public setPlayerInfo(data: op_pkt_def.PKT_PlayerInfo) {
        this.playerData = data;
        this.nameImage.setText(data.nickname);
        this.levelLabel.text = `${i18n.t("common.lv")} ${data.level.level}`;
        this.headicon.visible = false;
        if (data["avatar"]) {
            const url = Url.getOsdRes(data["avatar"]);
            this.headicon.load(url, this, () => {
                this.headicon.x = -this.width * 0.5 + this.headicon.displayWidth * 0.5 + 10 * this.dpr;
                this.headicon.visible = true;
            });
        }
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    private onSimpleClickHandler() {
        if (this.sendHandler) this.sendHandler.runWith(this.playerData);
    }
}
