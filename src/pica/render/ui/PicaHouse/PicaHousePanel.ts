import { op_client } from "pixelpai_proto";
import { NineSlicePatch, NineSliceButton, TabButton } from "apowophaserui";
import { BasePanel, CheckboxGroup, ItemsConsumeFunPanel, UiManager } from "gamecoreRender";
import { PicaHouseInfoPanel } from "./PicaHouseInfoPanel";
import { ModuleName } from "structure";
import { Font, Handler, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";
export class PicaHousePanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeShopBtn: NineSliceButton;
    private closeBtn: Phaser.GameObjects.Image;
    private roomInfoBtn: TabButton;
    private roomSettingBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private houseInfoPanel: PicaHouseInfoPanel;
    private mRoomInfoData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    private itemsPanel: ItemsConsumeFunPanel;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAHOUSE_NAME;
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
        this.setSize(width, height);
        this.itemsPanel.y = this.height * 0.5 - 60 * this.dpr;
        this.itemsPanel.x = this.width * 0.5;
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
        this.updateData();
    }

    hide() {
        this.mShow = false;
        this.removeListen();
        super.hide();
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

        super.destroy();
    }

    public setRoomInfoData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, isSelf: boolean = true) {
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
            this.houseInfoPanel.y = -this.content.height * 0.5 + this.houseInfoPanel.height * 0.5 + 30 * this.dpr;
            //  this.closeShopBtn.on(String(ClickEvent.Tap), this.onCloseShopHandler, this);
        } else {
            this.closeShopBtn.visible = false;
        }
        this.houseInfoPanel.setAttributeData(content, isSelf);
        this.roomSettingBtn.visible = isSelf;
    }
    on_REFURBISH_REQUIREMENTS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS) {
        this.itemsPanel.setHandler(new Handler(this, () => {
            this.render.renderEmitter(ModuleName.PICAHOUSE_NAME + "_queryrefurbish", this.mRoomInfoData.roomId);
        }));
        this.itemsPanel.setItemDatas(<any>content.requirements);
    }
    protected preload() {
        this.addAtlas(this.key, "room_information/room_information.png", "room_information/room_information.json");
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
        const bgwidth = 295 * this.dpr, bgheight = 370 * this.dpr;
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
        this.roomInfoBtn = this.createTabButton(i18n.t("room_info.infobtn"), "small_information");
        this.roomSettingBtn = this.createTabButton(i18n.t("room_info.setting"), "small_setting");
        this.roomInfoBtn.setPosition(-this.roomInfoBtn.width * 0.5 - 2 * this.dpr, -this.content.height * 0.5 - this.roomInfoBtn.height * 0.5 + 3 * this.dpr);
        this.roomSettingBtn.setPosition(this.roomSettingBtn.width * 0.5 + 2 * this.dpr, this.roomInfoBtn.y);
        this.topCheckBox = new CheckboxGroup();
        this.topCheckBox.appendItemAll([this.roomInfoBtn, this.roomSettingBtn]);
        this.topCheckBox.on("selected", this.onTabBtnHandler, this);
        this.content.add([this.roomInfoBtn, this.roomSettingBtn]);
        this.houseInfoPanel = new PicaHouseInfoPanel(this.scene, 0, 0, this.content.width - 40 * this.dpr, this.content.height - 70 * this.dpr, this.key, this.dpr);
        this.houseInfoPanel.y = -this.content.height * 0.5 + this.houseInfoPanel.height * 0.5 + 30 * this.dpr;
        this.houseInfoPanel.setHandler(new Handler(this, () => {
            this.itemsPanel.visible = true;
            this.add(this.itemsPanel);
            this.itemsPanel.resetMask();
            if (this.mRoomInfoData.undepreciated < 1) {
                this.render.renderEmitter(ModuleName.PICAHOUSE_NAME + "_queryrequirements", this.mRoomInfoData.roomId);
            } else {
                this.itemsPanel.setContent(i18n.t("room_info.renovatetips"));
                this.itemsPanel.setHandler(null);
            }
        }));
        this.content.add(this.houseInfoPanel);
        this.closeShopBtn = new NineSliceButton(this.scene, 0, this.houseInfoPanel.height - 30 * this.dpr, 94 * this.dpr, 29 * this.dpr, this.key, "close_shop", i18n.t("room_info.closeshop"), this.dpr, this.scale, {
            left: 14 * this.dpr,
            top: 0 * this.dpr,
            right: 14 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.closeShopBtn.setTextStyle({
            color: "#c12914",
            fontSize: 12 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        const shopBtnY = this.houseInfoPanel.y + this.houseInfoPanel.height * 0.5 + this.closeShopBtn.height * 0.5 + 20 * this.dpr;
        this.closeShopBtn.y = shopBtnY;
        this.houseInfoPanel.add(this.closeShopBtn);
        this.closeShopBtn.visible = false;
        this.topCheckBox.selectIndex(0);
        this.itemsPanel = new ItemsConsumeFunPanel(this.scene, 278 * this.dpr, 198 * this.dpr, this.dpr, this.scale);
        this.itemsPanel.createBackGrphaic(w, h);
        this.itemsPanel.setTextInfo(i18n.t("room_info.renovate").toUpperCase(), i18n.t("room_info.needmaterials"));
        this.itemsPanel.visible = false;

        this.add(this.content);
        this.resize(0, 0);
        super.init();
    }

    private updateData() {
        if (this.mRoomInfoData) {
            this.setRoomInfoData(this.mRoomInfoData);
        }
    }

    private onTabBtnHandler(btn: TabButton) {
        if (this.roomInfoBtn === btn) {
            this.houseInfoPanel.visible = true;
        } else {
            this.houseInfoPanel.visible = false;
        }
        if (this.roomSettingBtn === btn) {
            this.houseInfoPanel.visible = false;
        } else {
        }
    }

    private createTabButton(text: string, icon: string) {
        const btn = new TabButton(this.scene, this.key, "default tab", "check tab", text);
        btn.setTextStyle({ fontFamily: Font.DEFULT_FONT, fontSize: 12 * this.dpr, color: "#ffffff" });
        btn.setTextOffset(13 * this.dpr, 0);
        const img = this.scene.make.image({ key: this.key, frame: icon });
        btn.add(img);
        img.x = -btn.width * 0.5 + img.width * 0.5 + 7 * this.dpr;
        return btn;
    }

    private onCloseShopHandler() {
        this.render.renderEmitter(ModuleName.PICAHOUSE_NAME + "_closeshop", this.mRoomInfoData);
    }
    private onCloseHandler() {
        this.render.renderEmitter(ModuleName.PICAHOUSE_NAME + "_hide");
    }
}
