import { ClickEvent, Button, BBCodeText } from "apowophaserui";
import { DynamicImage, ItemInfoTips, ProgressMaskBar, ToggleColorButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Handler, i18n, Logger, UIHelper, Url } from "utils";
import { PicaTownNavigationPanel } from "./PicaTownNavigationPanel";
import { PicaMyNavigationPanel } from "./PicaMyNavigationPanel";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "../../../res";
import { op_client } from "pixelpai_proto";
import { PicaRoomNavigationPanel } from "./PicaRoomNavigationPanel";
import { CommonBackground } from "../../ui";
import { PicaRoomTypePanel } from "./PicaRoomTypePanel";
import { PicaTownNoNavigationPanel } from "./PicaTownNoNavigationPanel";
import { Render } from "../../pica.render";
export class PicaPartyNavigationPanel extends PicaBasePanel {
    public static PicaPartyNavigationPanel_CLOSE: string = "PicaPartyNavigationPanel_CLOSE";
    public static PICASELFROOM_DATA: string = "PICASELFROOM_DATA";
    public static PICATOWN_DATA: string = "PICATOWN_DATA";
    public static PICANAVIGATIONINIT_DATA: string = "PICANAVIGATIONINIT_DATA";
    public static PICAENTERROOM_DATA: string = "PICAENTERROOM_DATA";
    public myRoomPanel: PicaMyNavigationPanel;
    private content: Phaser.GameObjects.Container;
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: CommonBackground;
    private tilteName: Phaser.GameObjects.Text;
    private signProgressPanel: SignProgressPanel;
    private tooqingoption: TooQingChangeOption;
    private toggleCon: Phaser.GameObjects.Container;
    private optionLine: Phaser.GameObjects.Image;
    private selectLine: Phaser.GameObjects.Image;
    private curToggleItem: ToggleColorButton;
    private itemtips: ItemInfoTips;
    private townPanel: PicaTownNavigationPanel;
    private roomPanel: PicaRoomNavigationPanel;
    private roomTypePanel: PicaRoomTypePanel;
    private noItemPanel: PicaTownNoNavigationPanel;
    private optionType: number;
    private progressData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS;
    private toggleItems: ToggleColorButton[] = [];
    private myRoomDatas: any[];
    private tooqingOptionType: number;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPARTYNAVIGATION_NAME;
        this.atlasNames = [UIAtlasName.map, UIAtlasName.multiple_rooms];
        this.textures = [{ atlasName: "town_entrance_1", folder: UIAtlasName.map }, { atlasName: "map_room_icon", folder: UIAtlasName.map }, { atlasName: "map_tooqing_stay_tuned", folder: UIAtlasName.map }];
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

    public onShow() {
        const index = this.mShowData || 1;
        this.onToggleButtonHandler(undefined, this.toggleItems[index - 1]);
        if (this.tempDatas) {
            if (this.optionType !== 2 && this.optionType !== 3) {
                this.setNavigationListData(this.tempDatas);
            } else if (this.optionType === 2) {
                this.setRoomListData(this.tempDatas);
            } else if (this.optionType === 3) {
                for (const temp of this.myRoomDatas) {
                    this.setSelfRoomListData(temp);
                }
            }
        }
        if (this.progressData) this.setOnlineProgress(this.progressData);
    }
    public getToggleButton(index: number) {
        return this.toggleItems[index];
    }
    public setPartyListData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST, isSelf: boolean = true) {
        this.tempDatas = content;
        //  this.partyNavigationPanel.setPartyDataList(content);
    }
    public setNavigationListData(content: any[]) {
        this.tempDatas = content;
        if (!this.mInitialized) return;
        if (content && content.length > 0) {
            this.openTownNavigationPanel();
            this.hideNoItemPanel();
            this.townPanel.setTownDatas(content, this.tooqingOptionType);
            this.render.emitter.emit(PicaPartyNavigationPanel.PICATOWN_DATA);
        } else {
            this.openNoItemePanel();
            this.hideTownNavigationPanel();
        }

    }
    public setOnlineProgress(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        this.progressData = content;
        if (this.signProgressPanel)
            this.signProgressPanel.setProgressDatas(content);
    }

    public setRoomListData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST) {
        this.tempDatas = content;
        if (this.roomPanel)
            this.roomPanel.setRoomDatas(content);
    }

    public setSelfRoomListData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST) {
        this.myRoomDatas.push(content);
        if (this.myRoomPanel)
            this.myRoomPanel.setRoomDatas(content);
        this.render.emitter.emit(PicaPartyNavigationPanel.PICASELFROOM_DATA);
    }

    /**
     *  setRoomTypeDatas
     */
    public setRoomTypeDatas(datas: any[]) {
        if (this.roomTypePanel) this.roomTypePanel.setRoomTypeDatas(datas);
    }
    public get mineMapItem() {
        return this.townPanel.mineMapItem;
    }
    public get farmMapItem() {
        return this.townPanel.farmMapItem;
    }
    public destroy() {
        super.destroy();
    }

    protected onHide() {
        super.onHide();
        this.render.emitter.emit(PicaPartyNavigationPanel.PicaPartyNavigationPanel_CLOSE);
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
        this.tooqingoption = new TooQingChangeOption(this.scene, this.dpr);
        this.tooqingoption.setOptionDatas({ text: i18n.t("partynav.pica"), type: 1 }, { text: i18n.t("partynav.tooqing"), type: 2 });
        this.tooqingoption.setHandler(new Handler(this, this.onTooqingOptionHandler));
        this.tooqingoption.y = this.signProgressPanel.y + this.signProgressPanel.height * 0.5 + this.tooqingoption.height * 0.5 + 10 * this.dpr;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.toggleCon.y = this.tooqingoption.y + this.tooqingoption.height * 0.5 + 20 * this.dpr;
        this.add(this.toggleCon);
        this.optionLine = this.scene.make.image({ key: UIAtlasName.map, frame: "map_nav_line" });
        this.optionLine.displayHeight = 2 * this.dpr;
        this.selectLine = this.scene.make.image({ key: UIAtlasName.map, frame: "map_nav_select" });
        this.toggleCon.add([this.optionLine, this.selectLine]);
        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasName.uicommon, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.content.add([this.bg, this.tilteName, this.signProgressPanel, this.tooqingoption, this.toggleCon]);
        this.createOptionButtons();
        this.add([this.content, this.itemtips]);
        this.resize(0, 0);
        super.init();
        this.render.renderEmitter(this.key + "_questprogress");
        this.playMove(new Handler(this, () => {
            this.signProgressPanel.refreshMask();
            if (this.townPanel) {
                this.townPanel.refreshMask();
            }
            if (this.myRoomPanel) {
                this.myRoomPanel.refreshMask();
            }
            if (this.roomPanel) {
                this.roomPanel.refreshMask();
            }
            this.render.emitter.emit(PicaPartyNavigationPanel.PICANAVIGATIONINIT_DATA);
        }), new Handler(this, () => {
            if (this.townPanel) this.townPanel.refreshMask();
            if (this.myRoomPanel) {
                this.myRoomPanel.refreshMask();
            }
            if (this.roomPanel) {
                this.roomPanel.refreshMask();
            }
        }));
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("player_info.room"), type: 2 }, { text: i18n.t("partynav.town"), type: 1 }, { text: i18n.t("party.mine"), type: 3 }];
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

    private openTownNavigationPanel() {
        if (!this.townPanel) {
            const height = this.scaleHeight * 0.5 - this.toggleCon.y - 22 * this.dpr;
            this.townPanel = new PicaTownNavigationPanel(this.scene, 274 * this.dpr, height, this.dpr, this.scale);
            this.townPanel.setHandler(new Handler(this, this.onTownHandler));
            this.townPanel.y = this.toggleCon.y + height * 0.5 + 25 * this.dpr;
            this.content.add(this.townPanel);
        }
        this.townPanel.show();
        this.townPanel.refreshMask();
    }

    private hideTownNavigationPanel() {
        if (this.townPanel)
            this.townPanel.hide();
    }
    private openMyRoomPanel() {
        if (!this.myRoomPanel) {
            const height = this.scaleHeight * 0.5 - this.toggleCon.y - 22 * this.dpr;
            this.myRoomPanel = new PicaMyNavigationPanel(<Render>this.render, this.scene, 274 * this.dpr, height, this.dpr, this.scale);
            this.myRoomPanel.y = this.toggleCon.y + height * 0.5 + 25 * this.dpr;
            this.myRoomPanel.setHandler(new Handler(this, this.onMyRoomHandler));
            this.content.add(this.myRoomPanel);
        }
        this.myRoomPanel.show();
        this.myRoomPanel.refreshMask();
    }

    private hideMyRoomPanel() {
        if (this.myRoomPanel) {
            // this.content.remove(this.myRoomPanel);
            this.myRoomPanel.hide();
        }
    }
    private openRoomPanel() {
        if (!this.roomPanel) {
            const height = this.scaleHeight * 0.5 - this.toggleCon.y - 18 * this.dpr;
            this.roomPanel = new PicaRoomNavigationPanel(this.scene, 274 * this.dpr, height, this.dpr, this.scale);
            this.roomPanel.setHandler(new Handler(this, this.onRoomHandler));
            this.roomPanel.y = this.toggleCon.y + height * 0.5 - 60 * this.dpr;
            this.content.add(this.roomPanel);
        }
        this.roomPanel.visible = true;
        this.roomPanel.refreshMask();
        this.roomPanel.clearDatas();
    }

    private hideRoomPanel() {
        if (this.roomPanel) {
            this.roomPanel.visible = false;
        }
    }
    private openRoomTypePanel() {
        if (!this.roomTypePanel) {
            const height = this.scaleHeight;
            this.roomTypePanel = new PicaRoomTypePanel(this.scene, this.scaleWidth, height, this.dpr, this.scale);
            this.roomTypePanel.setHandler(new Handler(this, this.onRoomTypeHandler));
            this.roomTypePanel.y = this.scaleHeight * 0.5;
            this.roomTypePanel.x = this.scaleWidth * 0.5;
            this.add(this.roomTypePanel);
        }
        this.roomTypePanel.visible = true;
        this.roomTypePanel.refreshMask();
        this.render.renderEmitter(this.key + "_getRoomTypeList");
    }
    private hideRoomTypePanel() {
        if (this.roomTypePanel) {
            this.roomTypePanel.visible = false;
        }
    }
    private openNoItemePanel() {
        if (!this.noItemPanel) {
            const height = this.scaleHeight * 0.5 - this.toggleCon.y - 22 * this.dpr;
            this.noItemPanel = new PicaTownNoNavigationPanel(this.scene, 274 * this.dpr, height, this.dpr, this.scale);
            this.noItemPanel.y = this.toggleCon.y + height * 0.5 + 25 * this.dpr;
            this.content.add(this.noItemPanel);
        }
        this.noItemPanel.visible = true;
    }
    private hideNoItemPanel() {
        if (this.noItemPanel) {
            this.noItemPanel.visible = false;
        }
    }
    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggleItem === toggle) return;
        if (this.curToggleItem) this.curToggleItem.isOn = false;
        this.curToggleItem = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        toggle.isOn = true;
        this.hideTownNavigationPanel();
        this.hideRoomPanel();
        this.hideMyRoomPanel();
        this.hideNoItemPanel();
        if (this.optionType !== 2 && this.optionType !== 3) {
            this.openTownNavigationPanel();
            this.render.renderEmitter(this.key + "_getnavigatelist", this.optionType);
        } else if (this.optionType === 2) {
            this.openRoomPanel();
            this.render.renderEmitter(this.key + "_getRoomList", { page: 1, perPage: 100 });
        } else if (this.optionType === 3) {
            this.myRoomDatas = [];
            this.openMyRoomPanel();
            this.render.renderEmitter(this.key + "_getMyRoomList");
        }
    }

    private onTooqingOptionHandler(type: number) {
        let temps: any[];
        if (type === 1) {
            temps = [{ text: i18n.t("player_info.room"), type: 2 }, { text: i18n.t("partynav.town"), type: 1 }, { text: i18n.t("party.mine"), type: 3 }];
        } else {
            temps = [{ text: i18n.t("partynav.new"), type: 4 }, { text: i18n.t("partynav.hot"), type: 5 }, { text: i18n.t("partynav.collect"), type: 6 }];
        }
        for (const item of this.toggleItems) {
            item.visible = false;
        }
        for (let i = 0; i < temps.length; i++) {
            const temp = temps[i];
            const item = this.toggleItems[i];
            item.setData("item", temp.type);
            item.setText(temp.text);
            item.visible = true;
        }
        if (this.curToggleItem) {
            this.curToggleItem.isOn = false;
            this.curToggleItem = undefined;
        }
        const index = type === 1 ? 0 : 1;
        this.onToggleButtonHandler(undefined, this.toggleItems[index]);
        this.tooqingOptionType = type;
    }

    private onTownHandler(tag: string, data: any) {// op_client.IEditModeRoom
        if (tag === "enter") {
            this.render.renderEmitter(this.key + "_queryenter", data);
            if (data === "S1200010" || data === "S0021002") this.render.emitter.emit(PicaPartyNavigationPanel.PICAENTERROOM_DATA);
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

    private onRoomHandler(tag: string, data: any) {
        if (tag === "enter") {
            this.onEnterRoomHandler(data);
        } else if (tag === "query") {
            this.render.renderEmitter(this.key + "_getRoomList", { page: data, perPage: 100 });
        }
    }
    private onMyRoomHandler(tag: string, data: any) {
        if (tag === "enter") {
            this.onEnterRoomHandler(data);
        } else if (tag === "query") {
            this.render.renderEmitter(this.key + "_getMyRoomList");
        } else if (tag === "roomtype") {
            this.myRoomPanel.visible = false;
            this.openRoomTypePanel();
        }
    }
    private onEnterRoomHandler(roomID: string) {
        this.render.renderEmitter(this.key + "_queryenter", roomID);
    }
    private onRoomTypeHandler(data: any) {
        this.myRoomPanel.visible = true;
        this.hideRoomTypePanel();
        if (data !== "close") this.render.renderEmitter(this.key + "_createroom", data);
    }
    private showItemTipsState(item: Phaser.GameObjects.Container, offsety: number = 50 * this.dpr) {
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
        if (posx - this.itemtips.width * 0.5 < 0) {
            this.itemtips.x = this.itemtips.width * 0.5 + 10 * this.dpr;
        } else if (posx + this.itemtips.width * 0.5 > this.content.width) {
            this.itemtips.x = this.content.width - this.itemtips.width * 0.5 - 20 * this.dpr;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy + this.itemtips.height * 0.5 + 10 * this.dpr + offsety;
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
    private playMove(compl: Handler, update: Handler) {
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
                if (compl) compl.run();
            },
            onUpdate: () => {
                if (update) update.run();
            }
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
class TooQingChangeOption extends Phaser.GameObjects.Container {
    protected leftBtn: Button;
    protected rightBtn: Button;
    protected send: Handler;
    protected curButton: Button;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.leftBtn = new Button(scene, UIAtlasName.map, "map_nav_picktown", "map_nav_picktown", i18n.t("partynav.pica"), undefined, dpr);
        this.leftBtn.tweenEnable = false;
        this.leftBtn.setTextStyle(UIHelper.colorStyle("#9D6000", 14 * dpr));
        this.leftBtn.setFontStyle("bold");
        this.rightBtn = new Button(scene, UIAtlasName.map, "map_nav_tooqing", "map_nav_tooqing", i18n.t("partynav.tooqing"), undefined, dpr);
        this.rightBtn.tweenEnable = false;
        this.rightBtn.setTextStyle(UIHelper.colorStyle("#B0A9FF", 14 * dpr));
        this.rightBtn.setFontStyle("bold");
        const width = this.leftBtn.width + this.rightBtn.width - 14 * dpr;
        this.leftBtn.x = -this.leftBtn.width * 0.5 + 7 * dpr;
        this.rightBtn.x = this.rightBtn.width * 0.5 - 7 * dpr;
        this.leftBtn.on(ClickEvent.Tap, this.onLeftHandler, this);
        this.rightBtn.on(ClickEvent.Tap, this.onRightHandler, this);
        this.setSize(width, this.leftBtn.height);
        this.add([this.leftBtn, this.rightBtn]);
    }

    setHandler(send: Handler) {
        this.send = send;
    }
    setOptionDatas(left: { text: string, type: number }, right: { text: string, type: number }) {
        this.leftBtn.setText(left.text);
        this.leftBtn.setData("optiontype", left.type);
        this.rightBtn.setText(right.text);
        this.rightBtn.setData("optiontype", right.type);
    }
    private onLeftHandler() {
        if (this.curButton === this.leftBtn) return;
        this.leftBtn.setFrameNormal("map_nav_picktown");
        this.rightBtn.setFrameNormal("map_nav_tooqing");
        if (this.send) this.send.runWith(this.leftBtn.getData("optiontype"));
        this.curButton = this.leftBtn;
        this.leftBtn.setTextColor("#9D6000");
        this.rightBtn.setTextColor("#B0A9FF");
    }
    private onRightHandler() {
        if (this.curButton === this.rightBtn) return;
        this.leftBtn.setFrameNormal("map_nav_picktown_1");
        this.rightBtn.setFrameNormal("map_nav_tooqing_1");
        if (this.send) this.send.runWith(this.rightBtn.getData("optiontype"));
        this.curButton = this.rightBtn;
        this.rightBtn.setTextColor("#9D6000");
        this.leftBtn.setTextColor("#B0A9FF");
    }
}
