import { TabButton, ClickEvent, Button, ProgressBar, BBCodeText } from "apowophaserui";
import { CommonBackground, DynamicImage, ItemInfoTips, ProgressMaskBar, ToggleColorButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { PicaTownNavigationPanel } from "./PicaTownNavigationPanel";
import { PicaMyNavigationPanel } from "./PicaMyNavigationPanel";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
export class PicaPartyNavigationPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: CommonBackground;
    private tilteName: Phaser.GameObjects.Text;
    private signProgressPanel: SignProgressPanel;
    private toggleCon: Phaser.GameObjects.Container;
    private optionLine: Phaser.GameObjects.Image;
    private selectLine: Phaser.GameObjects.Image;
    private curToggleItem: ToggleColorButton;
    private itemtips: ItemInfoTips;
    private partyNavigationPanel: PicaTownNavigationPanel;
    private myRoomNavigationPanel: PicaMyNavigationPanel;
    private optionType: number;
    private mPartyData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST;
    private progressData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPARTYNAVIGATION_NAME;
        this.atlasNames = [UIAtlasName.map];
    }

    public resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.66);
        this.blackBg.fillRect(0, 0, width, height);
        this.content.x = -this.content.width * 0.5 - 10 * this.dpr;
        this.content.y = height * 0.5;
        this.setSize(width, height);
    }

    public setPartyListData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST, isSelf: boolean = true) {
        this.mPartyData = content;
        //  this.partyNavigationPanel.setPartyDataList(content);
    }
    public setOnlineProgress(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        this.progressData = content;
        this.signProgressPanel.setProgressDatas(content);
    }

    public setRoomListData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
        // this.myRoomNavigationPanel.setRoomDataList(content);
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.blackBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.blackBg.on("pointerup", this.onCloseHandler, this);
        this.add(this.blackBg);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 300 * this.dpr, bgheight = h;
        this.content.setSize(bgwidth, bgheight);
        this.bg = new CommonBackground(this.scene, 0, 0, bgwidth, bgheight);
        this.tilteName = this.scene.make.text({ text: i18n.t("partynav.onlinetips"), style: UIHelper.colorStyle("#FFF449", this.dpr * 12) });
        this.tilteName.setOrigin(0, 0.5);
        this.tilteName.setFontStyle("bold");
        this.tilteName.x = -bgwidth * 0.5 + 17 * this.dpr;
        this.tilteName.y = -bgheight * 0.5 + 40 * this.dpr;
        this.signProgressPanel = new SignProgressPanel(this.scene, bgwidth, 45 * this.dpr, UIAtlasName.map, this.dpr);
        this.signProgressPanel.y = this.tilteName.y + this.signProgressPanel.height * 0.5 + 13 * this.dpr;
        this.signProgressPanel.setHandler(new Handler(this, this.onProgressHandler));
        this.toggleCon = this.scene.make.container(undefined, false);
        this.toggleCon.y = this.signProgressPanel.y + this.signProgressPanel.height * 0.5 + 20 * this.dpr;
        this.add(this.toggleCon);
        this.optionLine = this.scene.make.image({ key: UIAtlasName.map, frame: "map_nav_line" });
        this.optionLine.displayHeight = 2 * this.dpr;
        this.selectLine = this.scene.make.image({ key: UIAtlasName.map, frame: "map_nav_select" });
        this.toggleCon.add([this.optionLine, this.selectLine]);
        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasName.uicommon, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.content.add([this.bg, this.tilteName, this.signProgressPanel, this.toggleCon, this.itemtips]);
        this.createOptionButtons();
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.playMove(new Handler(this, () => {
            this.signProgressPanel.refreshMask();
        }));
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("partynav.town"), type: 1 }, { text: i18n.t("player_info.room"), type: 2 }, { text: i18n.t("partynav.store"), type: 3 }];
        const allLin = 272 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        let tempitem: ToggleColorButton;
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
            if (!tempitem) tempitem = item;
        }
        tempitem.isOn = true;
        this.onToggleButtonHandler(undefined, tempitem);
        this.optionLine.y = 20 * this.dpr;
        this.selectLine.y = this.optionLine.y;
    }

    private openTownNavigationPanel() {
        if (!this.partyNavigationPanel) {
            this.partyNavigationPanel = new PicaTownNavigationPanel(this.scene, 274 * this.dpr, 487 * this.dpr, this.dpr, this.scale);
            this.partyNavigationPanel.setHandler(new Handler(this, this.onPartyListHandler));
            this.partyNavigationPanel.y = 0 * this.dpr;
        }
        this.content.add(this.partyNavigationPanel);
        this.partyNavigationPanel.refreshMask();
    }

    private hideTownNavigationPanel() {
        if (this.partyNavigationPanel)
            this.content.remove(this.partyNavigationPanel);
    }

    private openRoomNavigationPanel() {
        if (!this.myRoomNavigationPanel) {
            this.myRoomNavigationPanel = new PicaMyNavigationPanel(this.scene, this.content.width - 40 * this.dpr, this.content.height - 34 * this.dpr, this.key, this.dpr, this.scale);
            this.myRoomNavigationPanel.setHandler(new Handler(this, this.onEnterRoomHandler));
            this.myRoomNavigationPanel.y = -10 * this.dpr;
        }
        this.content.add(this.myRoomNavigationPanel);
        this.myRoomNavigationPanel.refreshMask();
    }

    private hideRoomNavigationPanel() {
        if (this.myRoomNavigationPanel) {
            this.myRoomNavigationPanel.clear();
            this.content.remove(this.myRoomNavigationPanel);
        }
    }
    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggleItem === toggle) return;
        if (this.curToggleItem) this.curToggleItem.isOn = false;
        this.curToggleItem = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        if (this.optionType === 1) {
            this.render.renderEmitter(this.key + "_querylist");
            this.render.renderEmitter(this.key + "_questprogress");

        } else if (this.optionType === 2) {

        } else {

        }
    }

    private onPartyListHandler(tag: string, data: any) {// op_client.IEditModeRoom
        if (tag === "hotel" || tag === "pictown" || tag === "partylist") {
            this.render.renderEmitter(this.key + "_queryenter", data.roomId);
        } else if (tag === "progress") {

        }
    }
    private onProgressHandler(index: number, item: SignProgressItem) {
        if (!this.progressData) return;
        const data = item.progressData;
        if (!data.received) {
            if (data.targetValue <= this.progressData.currentProgressValue) {
                this.render.renderEmitter(this.key + "_questreward", index);
            } else {
                this.itemtips.setItemData(data.rewards[0]);
                this.showItemTipsState(item);
            }
        }
    }
    private onEnterRoomHandler(roomID: string) {
        this.render.renderEmitter(this.key + "_queryenter", roomID);
    }
    private showItemTipsState(item: Phaser.GameObjects.Container, offsety: number = 0) {
        const posx = this.itemtips.x;
        const posy = this.itemtips.y;
        this.setTipsPosition(item, offsety);
        if (posx !== this.itemtips.x || posy !== this.itemtips.y) {
            this.itemtips.setVisible(true);
        } else {
            this.itemtips.setVisible(!this.itemtips.visible);
        }
    }
    private setTipsPosition(gameobject: Phaser.GameObjects.Container, offsety: number = 0) {
        let posx: number = gameobject.x;
        let posy: number = gameobject.y;
        let tempobject = <Phaser.GameObjects.Container>gameobject;
        while (tempobject.parentContainer !== this) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.itemtips.width * 0.5 < -this.width * 0.5) {
            this.itemtips.x = this.itemtips.width * 0.5 - this.width * 0.5 + 20 * this.dpr;
        } else if (posx + this.itemtips.width * 0.5 > this.width * 0.5) {
            this.itemtips.x = this.width * 0.5 - this.itemtips.width * 0.5 - 20 * this.dpr;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy - this.itemtips.height * 0.5 + 10 * this.dpr + offsety;
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
    private playMove(handler: Handler) {
        const from = -this.content.width * 0.5 - 10 * this.dpr;
        const to = this.content.width * 0.5;
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
                if (handler) handler.run();
            },
        });
    }
}

class SignProgressPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private progress: ProgressMaskBar;
    private progressItems: SignProgressItem[] = [];
    private receiveHandler: Handler;
    private text: BBCodeText;
    private timerID: any;

    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.progress = new ProgressMaskBar(scene, key, "map_online_progress_bottom", "map_online_progress_top");
        this.add(this.progress);
        this.text = new BBCodeText(scene, this.width * 0.5 - 13 * dpr, -35 * dpr, "", UIHelper.whiteStyle(dpr, 10)).setOrigin(1, 0.5);
        this.add(this.text);
    }

    public refreshMask() {
        this.progress.refreshMask();
    }
    public setProgressDatas(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        const len = content.steps.length;
        const maxvalue = 100, intervalue = maxvalue / (len - 1);
        const width = this.progress.width - 37 * this.dpr;
        let nextValue = 0, progress = 0, beforevalue = 0;
        for (let i = 0; i < len; i++) {
            const data = content.steps[i];
            let item: SignProgressItem;
            if (i < this.progressItems.length) {
                item = this.progressItems[i];
            } else {
                item = new SignProgressItem(this.scene, 0, 0, this.key, this.dpr);
                this.add(item);
                this.progressItems.push(item);
                item.setHandler(this.receiveHandler);
            }
            item.x = -width * 0.5 + (len > 1 ? width * (i) / (len - 1) : width * 0.5);
            item.y = 0;
            item.setItemData(data, i, content.currentProgressValue);
            if (data.targetValue <= content.currentProgressValue) {
                if (i > 0) progress += intervalue;
            } else {
                if (nextValue === 0) {
                    progress += intervalue * (content.currentProgressValue - beforevalue) / (data.targetValue - beforevalue);
                    nextValue = data.targetValue;
                }
            }
            beforevalue = data.targetValue;
        }
        this.progress.setProgress(progress, maxvalue);

        this.initCountDown(nextValue - content.currentProgressValue, beforevalue === nextValue);
    }

    public setHandler(handler: Handler) {
        this.receiveHandler = handler;
    }

    public destroy() {
        clearInterval(this.timerID);
        super.destroy();
    }

    private initCountDown(time: number, isLast: boolean) {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = undefined;
        }
        const interval = 1000;
        const timeextu = () => {
            const minute = Math.floor(time / 60);
            const second = time % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.text.text = i18n.t("party.progresstips") + `[color=#FFF449]${timetext}[/color]`;
            time--;
            if (time > 0) {
                this.timerID = setTimeout(() => {
                    timeextu();
                }, interval);
                return;
            } else {
                this.text.text = "";
                this.timerID = undefined;
            }
        };
        timeextu();
    }
}
class SignProgressItem extends Phaser.GameObjects.Container {
    public progressData: any;// op_client.IPKT_Progress
    public index: number;
    private dpr: number;
    private bg: Button;
    private icon: DynamicImage;
    private receiveHandler: Handler;
    private finishIcon: Phaser.GameObjects.Image;
    private balckgraphic: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.bg = new Button(scene, key, "map_online_undone_frame", "map_online_undone_frame");
        this.icon = new DynamicImage(scene, 0, 0);
        this.finishIcon = scene.make.image({ key, frame: "map_online_Check" });
        this.finishIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.balckgraphic = scene.make.graphics(undefined, false);
        this.balckgraphic.clear();
        this.balckgraphic.fillStyle(0, 0.5);
        this.balckgraphic.fillCircle(0, 0, 16 * dpr);
        this.add([this.bg, this.icon, this.balckgraphic, this.finishIcon]);
        this.finishIcon.visible = false;
    }

    public setItemData(data: any, index: number, curvalue: number) {// op_client.IPKT_Progress
        this.progressData = data;
        this.index = index;
        if (data.rewards && data.rewards.length > 0) {
            const url = Url.getOsdRes(data.rewards[0].display.texturePath);
            this.icon.load(url, this, () => {
                this.icon.scale = 1;
                this.icon.scaleY = 29 * this.dpr / this.icon.displayHeight;
                this.icon.scaleX = this.icon.scaleY;
            });
        }
        this.finishIcon.visible = false;
        this.balckgraphic.visible = false;
        if (data.targetValue <= curvalue) {
            this.bg.setFrameNormal("map_online_receive_frame", "map_online_receive_frame");
            if (data.received) {
                this.finishIcon.visible = true;
                this.balckgraphic.visible = true;
            }
            this.icon.clearTint();
        } else {
            this.bg.setFrameNormal("map_online_undone_frame", "map_online_undone_frame");
            this.icon.setTint(0x8B8B7A);
        }
        if (!data.received) {
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
            this.bg.on(String(ClickEvent.Tap), this.onReceiveHandler, this);
        } else {
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
        }

    }

    public setHandler(receive: Handler) {
        this.receiveHandler = receive;
    }

    private onReceiveHandler() {
        if (this.receiveHandler) this.receiveHandler.runWith([this.index, this]);
    }
}
