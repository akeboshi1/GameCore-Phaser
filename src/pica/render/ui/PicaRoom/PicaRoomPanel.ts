import { op_client } from "pixelpai_proto";
import { NineSlicePatch, NineSliceButton, TabButton, Button, ClickEvent } from "apowophaserui";
import { BasePanel, CheckboxGroup, UiManager } from "gamecoreRender";
import { PicaRoomInfoPanel } from "./PicaRoomInfoPanel";
import { ModuleName } from "structure";
import { Font, Handler, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "../../../res";
import { ItemsConsumeFunPanel } from "..";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaRoomSettingPanel } from "./PicaRoomSettingPanel";
export class PicaRoomPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeBtn: Button;
    private roomInfoBtn: TabButton;
    private roomSettingBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private roomInfoPanel: PicaRoomInfoPanel;
    private roomSettingPanel: PicaRoomSettingPanel;
    private mRoomInfoData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    private mPartyData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAROOM_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.room_info, UIAtlasName.multiple_rooms];
    }

    public resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
        this.roomInfoBtn.y = -this.content.height * 0.5 - this.roomInfoBtn.height * 0.5 + 5 * this.dpr;
        this.roomSettingBtn.y = this.roomInfoBtn.y;
        this.closeBtn.y = -this.content.height * 0.5 + this.dpr * 5;
        this.closeBtn.x = this.content.width * 0.5 - 5 * this.dpr;
    }

    public onShow() {
        if (this.mRoomInfoData) this.setRoomInfoData(this.mRoomInfoData);
        if (this.mPartyData) this.setPartyInfo(this.mPartyData);
    }

    public setRoomInfoData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.mRoomInfoData = content;
        if (!this.mInitialized) return;
        if (this.roomInfoPanel) this.roomInfoPanel.setAttributeData(content);
    }

    public setPartyInfo(partyData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS) {
        this.mPartyData = partyData;
        if (!this.mInitialized) return;
        if (this.roomInfoPanel) this.roomInfoPanel.setPartyData(this.mPartyData);
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
        const bgwidth = 334 * this.dpr, bgheight = 460 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        this.bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasName.uicommon1, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 60 * this.dpr
        });
        this.content.add(this.bg);
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close", "close");
        this.closeBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
        this.content.add([this.closeBtn]);
        this.roomInfoBtn = this.createTabButton(i18n.t("room_info.infobtn"), "small_information", 1);
        this.roomSettingBtn = this.createTabButton(i18n.t("room_info.setting"), "small_setting", 2);
        this.roomInfoBtn.setPosition(-this.roomInfoBtn.width * 0.5 - 2 * this.dpr, -this.content.height * 0.5 - this.roomInfoBtn.height * 0.5 + 3 * this.dpr);
        this.roomSettingBtn.setPosition(this.roomSettingBtn.width * 0.5 + 2 * this.dpr, this.roomInfoBtn.y);
        this.topCheckBox = new CheckboxGroup();
        this.topCheckBox.appendItemAll([this.roomInfoBtn, this.roomSettingBtn]);
        this.topCheckBox.on("selected", this.onTabBtnHandler, this);
        this.content.add([this.roomInfoBtn, this.roomSettingBtn]);
        this.topCheckBox.selectIndex(0);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
    }

    private showRoomInfoPanel() {
        if (!this.roomInfoPanel) {
            this.roomInfoPanel = new PicaRoomInfoPanel(this.scene, this.uiManager, 0, 0, this.content.width - 40 * this.dpr, this.content.height - 70 * this.dpr, this.dpr);
            this.roomInfoPanel.y = -this.content.height * 0.5 + this.roomInfoPanel.height * 0.5 + 30 * this.dpr;
            this.roomInfoPanel.setHandler(new Handler(this, this.onSendHandler));
            this.content.add(this.roomInfoPanel);
        }
        this.roomInfoPanel.show();
    }
    private hideRoomInfoPanel() {
        if (this.roomInfoPanel) this.roomInfoPanel.hide();
    }
    private showRoomSettingPanel() {
        if (!this.roomSettingPanel) {
            this.roomSettingPanel = new PicaRoomSettingPanel(this.scene, 0, 0, this.content.width - 40 * this.dpr, this.content.height - 70 * this.dpr, this.dpr);
            this.roomSettingPanel.y = -this.content.height * 0.5 + this.roomSettingPanel.height * 0.5 + 30 * this.dpr;
            this.roomSettingPanel.setHandler(new Handler(this, this.onSendHandler));
            this.content.add(this.roomSettingPanel);
        }
        this.roomSettingPanel.show();
    }
    private hideRoomSettingPanel() {
        if (this.roomSettingPanel) this.roomSettingPanel.hide();
    }
    private onTabBtnHandler(btn: TabButton) {
        const optionType = btn.getData("optionType");
        if (optionType === 1) {
            this.hideRoomSettingPanel();
            this.showRoomInfoPanel();
            if (this.mRoomInfoData) this.roomInfoPanel.setAttributeData(this.mRoomInfoData);
            if (this.mPartyData) this.roomInfoPanel.setPartyData(this.mPartyData);
        } else {
            this.showRoomSettingPanel();
            this.hideRoomInfoPanel();
        }
    }

    private createTabButton(text: string, icon: string, optionType: number) {
        const btn = new TabButton(this.scene, UIAtlasName.room_info, "room_tab_unselected", "room_tab_selected", text);
        btn.setTextStyle({ fontFamily: Font.DEFULT_FONT, fontSize: 12 * this.dpr, color: "#ffffff" });
        btn.setTextOffset(13 * this.dpr, 0);
        const img = this.scene.make.image({ key: UIAtlasName.room_info, frame: icon });
        btn.add(img);
        img.x = -btn.width * 0.5 + img.width * 0.5 + 23 * this.dpr;
        btn.setData("optionType", optionType);
        return btn;
    }

    private onCloseHandler() {
        this.render.renderEmitter(ModuleName.PICAROOM_NAME + "_hide");
    }

    private onSendHandler(tag: string, data: any) {
        if (tag === "name") {
            if (data.length >= 3) {
                this.render.renderEmitter(ModuleName.PICAROOM_NAME + "_name", data);
            } else {
                this.onNoticeHandler(i18n.t("room_info.editornametips"));
            }
        } else if (tag === "open") {
            // this.render.renderEmitter(ModuleName.PICAROOM_NAME + "_openparty");
            this.onNoticeHandler(i18n.t("noticeTips.staytuned"));
        } else if (tag === "defaultroom") {
            this.render.renderEmitter(ModuleName.PICAROOM_NAME + "_defaultroom", this.mRoomInfoData.roomId);
        }
    }

    private onNoticeHandler(text: string) {
        const tempdata = {
            text: [{ text, node: undefined }]
        };
        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
        return;
    }
}
