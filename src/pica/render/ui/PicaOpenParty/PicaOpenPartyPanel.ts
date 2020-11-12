import { op_client } from "pixelpai_proto";
import { NineSlicePatch, TabButton } from "apowophaserui";
import { BasePanel, CheckboxGroup, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { Font, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { PicaOpenPartyCreatePanel } from "./PicaOpenPartyCreatePanel";
export class PicaOpenPartyPanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeBtn: Phaser.GameObjects.Image;
    private partyBtn: TabButton;
    private settingBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private partyCreatePanel: PicaOpenPartyCreatePanel;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAOPENPARTY_NAME;
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
        this.setSize(width, height);
        this.partyCreatePanel.resize();
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

    public setPartyData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS, isSelf: boolean = true) {
        this.settingBtn.visible = isSelf;
        const username = this.mWorld.user.userData.playerProperty.nickname;
        this.partyCreatePanel.setPartyData(content, username, Math.ceil(this.mWorld.clock.unixTime / 1000));
        if (content.created) {
            this.partyBtn.setText(i18n.t("party.partymgr"));
        } else {
            this.partyBtn.setText(i18n.t("main_ui.party"));
        }
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
        const bgwidth = 295 * this.dpr, bgheight = 450 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        this.bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasKey.common2Key, "bg", {
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
        this.partyBtn = this.createTabButton(i18n.t("main_ui.party"));
        this.settingBtn = this.createTabButton(i18n.t("common.setting"));
        this.partyBtn.setPosition(-this.partyBtn.width * 0.5 - 2 * this.dpr, -this.content.height * 0.5 - this.partyBtn.height * 0.5 + 3 * this.dpr);
        this.settingBtn.setPosition(this.settingBtn.width * 0.5 + 2 * this.dpr, this.partyBtn.y);
        this.topCheckBox = new CheckboxGroup();
        this.topCheckBox.appendItemAll([this.partyBtn, this.settingBtn]);
        this.topCheckBox.on("selected", this.onTabBtnHandler, this);
        this.content.add([this.partyBtn, this.settingBtn]);
        this.partyCreatePanel = new PicaOpenPartyCreatePanel(this.uiManager, 0, 0, this.content.width - 20 * this.dpr, this.content.height - 70 * this.dpr, this.key, this.dpr, this.scale);
        this.partyCreatePanel.on("openparty", this.onOpenPartyHandler, this);
        this.partyCreatePanel.on("showtips", this.showPanelHandler, this);
        this.partyCreatePanel.on("querytheme", this.onQueryThemeHandler, this);
        this.partyCreatePanel.y = 0;
        this.content.add(this.partyCreatePanel);
        // const mblackbg = this.scene.make.graphics(undefined, false);
        // mblackbg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        // mblackbg.fillStyle(0, 0.66);
        // mblackbg.fillRect(-w * 0.5, -h * 0.5 + this.itemsPanel.y, w, h);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.topCheckBox.selectIndex(0);
    }

    private onTabBtnHandler(btn: TabButton) {
        if (this.partyBtn === btn) {
            this.partyCreatePanel.show();
            this.onQueryThemeHandler();
        } else {
            this.partyCreatePanel.hide();
        }
        if (this.settingBtn === btn) {
        } else {
        }
    }

    private createTabButton(text: string) {
        const btn = new TabButton(this.scene, UIAtlasKey.common2Key, "default_tab", "check_tab", text);
        btn.tweenEnable = false;
        btn.setTextStyle({ fontFamily: Font.DEFULT_FONT, fontSize: 16 * this.dpr, color: "#ffffff" });
        btn.setTextOffset(0, 0);
        return btn;
    }

    private onCloseHandler() {
        this.render.renderEmitter(ModuleName.PICAOPENPARTY_NAME + "_close");
    }

    private onOpenPartyHandler(topic: string, name: string, des: string, ticket: number, created: boolean) {
        this.render.renderEmitter(ModuleName.PICAOPENPARTY_NAME + "_queryopen", { topic, name, des, ticket });
        this.render.renderEmitter(ModuleName.PICAOPENPARTY_NAME + "_close");
        // const mgr = this.mWorld.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        this.showPanelHandler("PicaNotice", !created ? i18n.t("party.opentips") : i18n.t("party.modifytips"));
    }
    private showPanelHandler(panelName: string, text: string) {
        if (!this.mWorld) {
            return;
        }
        const data = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();
        data.text = [{ text, node: undefined }];
        const uiManager = this.mWorld.uiManager;
        uiManager.showMed(panelName, data);
    }
    private onQueryThemeHandler() {
        this.render.renderEmitter(ModuleName.PICAOPENPARTY_NAME + "_querytheme");
    }
}
