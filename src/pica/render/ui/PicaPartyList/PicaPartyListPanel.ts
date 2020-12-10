import { NineSlicePatch, NineSliceButton, TabButton, ClickEvent, NinePatchTabButton } from "apowophaserui";
import { BasePanel, CheckboxGroup, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, Handler, i18n } from "utils";
import { PicaPartyNavigationPanel } from "./PicaPartyNavigationPanel";
import { PicaMyRoomNavigationPanel } from "./PicaMyRoomNavigationPanel";
export class PicaPartyListPanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeBtn: Phaser.GameObjects.Image;
    private navigationBtn: TabButton;
    private mineBtn: TabButton;
    private searchBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private partyNavigationPanel: PicaPartyNavigationPanel;
    private myRoomNavigationPanel: PicaMyRoomNavigationPanel;
    private mPartyData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAPARTYLIST_NAME;
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5 + 20 * this.dpr;
        this.setSize(width, height);
    }
    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.onCloseHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.onCloseHandler, this);
    }

    public destroy() {
        this.removeListen();
        super.destroy();
    }

    public setPartyListData(content: any, isSelf: boolean = true) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
        this.mPartyData = content;
        this.partyNavigationPanel.setPartyDataList(content);
    }
    public setOnlineProgress(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        this.partyNavigationPanel.setSignProgress(content);
    }
    public setRoomListData(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY
        this.myRoomNavigationPanel.setRoomDataList(content);
    }
    protected preload() {
        this.addAtlas(this.key, "party/party.png", "party/party.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mBackground.fillStyle(0, 0.66);
        this.mBackground.fillRect(0, 0, w, h);
        this.add(this.mBackground);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 295 * this.dpr, bgheight = 490 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        this.bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasKey.commonKey, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 60 * this.dpr
        });
        this.content.add(this.bg);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: -this.bg.height * 0.5 + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" }).setScale(1.3);
        this.closeBtn.setInteractive();
        this.closeBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.content.add([this.closeBtn]);
        this.navigationBtn = this.createTabButton(i18n.t("party.navigation"));
        this.mineBtn = this.createTabButton(i18n.t("party.mine"));
        // this.searchBtn = this.createTabButton(i18n.t("common.search"));
        this.navigationBtn.setPosition(-this.navigationBtn.width - 2 * this.dpr, -this.content.height * 0.5 - this.navigationBtn.height * 0.5 + 5 * this.dpr);
        this.mineBtn.setPosition(this.navigationBtn.x + this.navigationBtn.width + 2 * this.dpr, this.navigationBtn.y);
        // this.searchBtn.setPosition(this.mineBtn.x + this.mineBtn.width + 2 * this.dpr, this.navigationBtn.y);
        this.topCheckBox = new CheckboxGroup();
        this.topCheckBox.appendItemAll([this.navigationBtn, this.mineBtn]);
        this.topCheckBox.on("selected", this.onTabBtnHandler, this);
        this.content.add([this.navigationBtn, this.mineBtn]);

        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.topCheckBox.selectIndex(0);
    }
    private onTabBtnHandler(btn: TabButton) {
        if (this.navigationBtn === btn) {
            this.openPartyNavigationPanel();
            this.hideRoomNavigationPanel();
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querylist");
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_questprogress");
        } else if (this.mineBtn === btn) {
            this.openRoomNavigationPanel();
            this.hidePartyNavigationPanel();
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_getMyRoomList");
        } else if (this.searchBtn === btn) {

        }
    }

    private openPartyNavigationPanel() {
        if (!this.partyNavigationPanel) {
            this.partyNavigationPanel = new PicaPartyNavigationPanel(this.scene, this.content.width - 40 * this.dpr, this.content.height - 40 * this.dpr, this.key, this.dpr, this.scale);
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

    private createTabButton(text: string) {
        const btn = new TabButton(this.scene, UIAtlasKey.common2Key, "default_tab_s", "check_tab_s", text);
        btn.tweenEnable = false;
        btn.setTextStyle({ fontFamily: Font.DEFULT_FONT, fontSize: 16 * this.dpr, color: "#ffffff" });
        return btn;
    }
    private onCloseHandler() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_close");
    }
    private onPartyListHandler(tag: string, data: any) {// op_client.IEditModeRoom
        if (tag === "hotel" || tag === "pictown" || tag === "partylist") {
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryenter", data.roomId);
        } else if (tag === "progress") {

        }
    }
    private onProgressRewardHandler(index: number) {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_questreward", index);
    }
    private onEnterRoomHandler(roomID: string) {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryenter", roomID);
    }
}
