import { op_client } from "pixelpai_proto";
import { NineSlicePatch, NineSliceButton, TabButton, Button, ClickEvent } from "apowophaserui";
import { BasePanel, CheckboxGroup, UiManager } from "gamecoreRender";
import { PicaRoomInfoPanel } from "./PicaRoomInfoPanel";
import { ModuleName } from "structure";
import { Font, Handler, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "../../../res";
import { ItemsConsumeFunPanel } from "..";
import { PicaBasePanel } from "../pica.base.panel";
export class PicaRoomPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeShopBtn: NineSliceButton;
    private closeBtn: Button;
    private roomInfoBtn: TabButton;
    private roomSettingBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private roomInfoPanel: PicaRoomInfoPanel;
    private mRoomInfoData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAROOM_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.room_info];
    }

    public resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
    }

    public setRoomInfoData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.mRoomInfoData = content;
        if (!this.mInitialized) return;
        const bgwidth = 295 * this.dpr;
        let bgheight = 370 * this.dpr;
        if (content.roomType === "store") {
            bgheight = 460 * this.dpr;
            this.content.setSize(bgwidth, bgheight);
            this.bg.resize(bgwidth, bgheight);
            //  this.closeShopBtn.visible = true;
            this.roomInfoBtn.y = -this.content.height * 0.5 - this.roomInfoBtn.height * 0.5 + 5 * this.dpr;
            this.roomSettingBtn.y = this.roomInfoBtn.y;
            this.closeBtn.y = -this.bg.height * 0.5 + this.dpr * 5;
            this.roomInfoPanel.y = -this.content.height * 0.5 + this.roomInfoPanel.height * 0.5 + 30 * this.dpr;
            //  this.closeShopBtn.on(String(ClickEvent.Tap), this.onCloseShopHandler, this);
        } else {
            this.closeShopBtn.visible = false;
        }
        this.roomInfoPanel.setAttributeData(content);
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
        const bgwidth = 295 * this.dpr, bgheight = 370 * this.dpr;
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
        this.roomInfoBtn = this.createTabButton(i18n.t("room_info.infobtn"), "small_information");
        this.roomSettingBtn = this.createTabButton(i18n.t("room_info.setting"), "small_setting");
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

    private updateData() {
        if (this.mRoomInfoData) {
            this.setRoomInfoData(this.mRoomInfoData);
        }
    }

    private showRoomInfoPanel() {
        if (!this.roomInfoPanel) {
            this.roomInfoPanel = new PicaRoomInfoPanel(this.scene, 0, 0, this.content.width - 40 * this.dpr, this.content.height - 70 * this.dpr,  this.dpr);
            this.roomInfoPanel.y = -this.content.height * 0.5 + this.roomInfoPanel.height * 0.5 + 30 * this.dpr;
            this.roomInfoPanel.setHandler(new Handler(this, () => {
            }));
            this.content.add(this.roomInfoPanel);
        }
        this.roomInfoPanel.visible = false;
    }
    private hideRoomInfoPanel() {
        this.roomInfoPanel.visible = false;
    }

    private onTabBtnHandler(btn: TabButton) {
        if (this.roomInfoBtn === btn) {
            this.roomInfoPanel.visible = true;
        } else {
            this.roomInfoPanel.visible = false;
        }
        if (this.roomSettingBtn === btn) {
            this.roomInfoPanel.visible = false;
        } else {
        }
    }

    private createTabButton(text: string, icon: string) {
        const btn = new TabButton(this.scene, this.key, "default tab", "check tab", text);
        btn.setTextStyle({ fontFamily: Font.DEFULT_FONT, fontSize: 12 * this.dpr, color: "#ffffff" });
        btn.setTextOffset(13 * this.dpr, 0);
        const img = this.scene.make.image({ key: UIAtlasName.room_info, frame: icon });
        btn.add(img);
        img.x = -btn.width * 0.5 + img.width * 0.5 + 7 * this.dpr;
        return btn;
    }

    private onCloseHandler() {
        this.render.renderEmitter(ModuleName.PICAROOM_NAME + "_hide");
    }
}
