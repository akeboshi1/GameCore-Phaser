import { TabButton, ClickEvent, Button, ProgressBar } from "apowophaserui";
import { CommonBackground, DynamicImage, ItemInfoTips, ToggleColorButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { PicaTownNavigationPanel } from "./PicaTownNavigationPanel";
import { PicaMyRoomNavigationPanel } from "./PicaMyRoomNavigationPanel";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
export class PicaPartyNavigationPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: CommonBackground;
    private tilteName: Phaser.GameObjects.Text;
    private signProgressPanel: SignProgressPanel;
    private selectLine: Phaser.GameObjects.Graphics;
    private curToggleItem: ToggleColorButton;
    private itemtips: ItemInfoTips;
    private partyNavigationPanel: PicaTownNavigationPanel;
    private myRoomNavigationPanel: PicaMyRoomNavigationPanel;
    private optionType: number;
    private mPartyData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
    private progressData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPARTYNAVIGATION_NAME;
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.66);
        this.blackBg.fillRect(0, 0, w, h);
        this.content.x = -this.content.width * 0.5 - 10 * this.dpr;
        this.content.y = height * 0.5 + 20 * this.dpr;
        this.selectLine.clear();
        this.selectLine.fillStyle(0xFFF449, 0.5);
        this.selectLine.fillRect(-29 * this.dpr, 0, 58 * this.dpr, 2 * this.dpr);
        this.setSize(width, height);
    }

    public setPartyListData(content: any, isSelf: boolean = true) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
        this.mPartyData = content;
        this.partyNavigationPanel.setPartyDataList(content);
    }
    public setOnlineProgress(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        this.progressData = content;
        this.signProgressPanel.setProgressDatas(content);
    }

    public setRoomListData(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY
        this.myRoomNavigationPanel.setRoomDataList(content);
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
        this.tilteName = this.scene.make.text({ text: i18n.t("task.title"), style: UIHelper.whiteStyle(this.dpr, 18) });
        this.tilteName.setOrigin(0, 0.5);
        this.tilteName.setFontStyle("bold");
        this.tilteName.x = -bgwidth * 0.5 + 20 * this.dpr;
        this.tilteName.y = -bgheight * 0.5 + 40 * this.dpr;
        this.signProgressPanel = new SignProgressPanel(this.scene, 252 * this.dpr, 45 * this.dpr, this.key, this.dpr);
        this.signProgressPanel.y = -this.height * 0.5 + 15 * this.dpr;
        this.signProgressPanel.setHandler(new Handler(this, this.onProgressHandler));
        this.content.add([this.bg, this.tilteName, this.signProgressPanel]);
        this.selectLine = this.scene.make.graphics(undefined, false);
        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasName.uicommon, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.content.add([this.selectLine, this.itemtips]);
        this.createOptionButtons();

        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.playMove(new Handler(this, () => {

        }));
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("partynav.town"), type: 1 }, { text: i18n.t("player_info.room"), type: 2 }, { text: i18n.t("partynav.store"), type: 3 }];
        const allLin = 272 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        const posy = -this.height * 0.5 + 75 * this.dpr;
        let tempitem: ToggleColorButton;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text);
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.y = posy;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.content.add(item);
            item.setChangeColor("#FFF449");
            item.setFontSize(14 * this.dpr);
            posx += cellwidth;
            if (!tempitem) tempitem = item;
        }
        tempitem.isOn = true;
        this.onToggleButtonHandler(undefined, tempitem);
    }


    private openPartyNavigationPanel() {
        if (!this.partyNavigationPanel) {
            this.partyNavigationPanel = new PicaTownNavigationPanel(this.scene, this.content.width - 40 * this.dpr, this.content.height - 40 * this.dpr, this.key, this.dpr, this.scale);
            this.partyNavigationPanel.setHandler(new Handler(this, this.onPartyListHandler));
            this.partyNavigationPanel.y = 0 * this.dpr;
            this.partyNavigationPanel.on("questreward", this.onProgressRewardHandler, this);
        }
        this.content.add(this.partyNavigationPanel);
        this.partyNavigationPanel.refreshMask();
    }

    private hidePartyNavigationPanel() {
        if (this.partyNavigationPanel)
            this.content.remove(this.partyNavigationPanel);
    }

    private openRoomNavigationPanel() {
        if (!this.myRoomNavigationPanel) {
            this.myRoomNavigationPanel = new PicaMyRoomNavigationPanel(this.scene, this.content.width - 40 * this.dpr, this.content.height - 34 * this.dpr, this.key, this.dpr, this.scale);
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
        this.selectLine.y = toggle.y + 20 * this.dpr;
        this.render.renderEmitter(ModuleName.PICATASK_NAME + "_questlist", this.optionType);
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
                this.emit("questreward", index);
            } else {
                this.itemtips.setItemData(data.rewards[0]);
                this.showItemTipsState(item);
            }
        }
    }
    private onProgressRewardHandler(index: number) {
        this.render.renderEmitter(this.key + "_questreward", index);
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
    private progress: ProgressBar;
    private progressItems: SignProgressItem[] = [];
    private receiveHandler: Handler;
    private text: Phaser.GameObjects.Text;
    private timerID: any;

    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        const barConfig = {
            x: 0 * dpr / 2,
            y: 15 * dpr,
            width: 218 * dpr,
            height: 11 * dpr,
            background: {
                x: 0,
                y: 0,
                width: 251 * dpr,
                height: 11 * dpr,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "order_progress_bottom"
            },
            bar: {
                x: 0,
                y: 0,
                width: 251 * dpr,
                height: 11 * dpr,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "order_progress_top"
            },
            dpr,
            textConfig: undefined
        };
        this.progress = new ProgressBar(scene, barConfig);
        this.add(this.progress);
        this.text = scene.make.text({ x: this.width / 2, y: -this.height * 0.5 + 11 * dpr, text: "", style: { color: "#6666FF", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        // this.text.setStroke("#6666FF", 1 * dpr);
        this.text.setOrigin(1, 0.5);
        this.add(this.text);
    }

    public setProgressDatas(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        const len = content.steps.length;
        const maxvalue = 100, intervalue = maxvalue / (len - 1);
        const width = this.progress.width;
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
            item.y = 15 * this.dpr;
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
            this.text.text = i18n.t("party.progresstips", { timer: timetext });
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
    private key: string;
    private dpr: number;
    private bg: Button;
    private icon: DynamicImage;
    private text: Phaser.GameObjects.Text;
    private receiveHandler: Handler;
    private finishIcon: Phaser.GameObjects.Image;
    private balckgraphic: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.bg = new Button(scene, key, "order_progress_unfinished", "order_progress_unfinished");
        this.icon = new DynamicImage(scene, 0, 0);
        this.text = scene.make.text({ x: 2 * dpr, y: -this.bg.height * 0.5 - 8 * dpr, text: "10", style: { color: "#FFDD00", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setStroke("#905B06", 2 * dpr).setOrigin(0.5);
        this.finishIcon = scene.make.image({ key, frame: "order_progress_ok" });
        this.finishIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.balckgraphic = scene.make.graphics(undefined, false);
        this.balckgraphic.clear();
        this.balckgraphic.fillStyle(0, 0.5);
        this.balckgraphic.fillCircle(0, 0, 16 * dpr);
        this.add([this.bg, this.icon, this.text, this.balckgraphic, this.finishIcon]);
        this.finishIcon.visible = false;
    }

    public setItemData(data: any, index: number, curvalue: number) {// op_client.IPKT_Progress
        this.progressData = data;
        this.index = index;
        this.text.text = index === 0 ? i18n.t("common.sign") : i18n.t("party.onlinetime", { name: Math.floor(data.targetValue / 60) });
        this.text.visible = index === 0 ? true : false;
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
            this.bg.setFrameNormal("order_progress_finished", "order_progress_finished");
            if (data.received) {
                this.finishIcon.visible = true;
                this.balckgraphic.visible = true;
            }
            this.icon.clearTint();
        } else {
            this.bg.setFrameNormal("order_progress_unfinished", "order_progress_unfinished");
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

