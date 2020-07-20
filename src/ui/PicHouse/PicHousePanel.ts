import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { i18n } from "../../i18n";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Font } from "../../utils/font";
import { Logger } from "../../utils/log";
import { NineSlicePatch, Button,NineSliceButton,TabButton  } from "@apowo/phaserui";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { CheckboxGroup } from "../components/checkbox.group";
import { PicHouseInfoPanel } from "./PicHouseInfoPanel";
export class PicHousePanel extends BasePanel {
    private readonly key = "pichousepanel";
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private editorRoomBtn: NineSliceButton;
    private closeBtn: Phaser.GameObjects.Image;
    private roomInfoBtn: TabButton;
    private roomSettingBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private houseInfoPanel: PicHouseInfoPanel;
    private mRoomInfoData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        //  this.scale = 1;
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
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
        this.updateData();
    }

    hide() {
        this.mShow = false;
        this.removeListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.onCloseHandler, this);
        this.editorRoomBtn.on("pointerup", this.onEnterEditorHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.onCloseHandler, this);
        this.editorRoomBtn.off("pointerup", this.onEnterEditorHandler, this);
    }

    public destroy() {

        super.destroy();
    }

    public setRoomInfoData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, isSelf: boolean = true) {
        this.mRoomInfoData = content;
        if (!this.mInitialized) return;
        this.houseInfoPanel.setAttributeData(content);
        this.roomSettingBtn.visible = isSelf;
        this.editorRoomBtn.visible = isSelf;
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
            bottom: 80 * this.dpr
        });
        this.content.add(this.bg);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: -this.bg.height * 0.5 + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" }).setScale(1.3);
        this.closeBtn.setInteractive();
        this.content.add([this.closeBtn]);
        this.roomInfoBtn = this.createTabButton(i18n.t("room_info.infobtn"), "small_information");
        this.roomSettingBtn = this.createTabButton(i18n.t("room_info.setting"), "small_setting");
        this.roomInfoBtn.setPosition(-this.roomInfoBtn.width * 0.5 - 2 * this.dpr, -this.content.height * 0.5 - this.roomInfoBtn.height * 0.5 + 2 * this.dpr);
        this.roomSettingBtn.setPosition(this.roomSettingBtn.width * 0.5 + 2 * this.dpr, this.roomInfoBtn.y);
        this.topCheckBox = new CheckboxGroup();
        this.topCheckBox.appendItemAll([this.roomInfoBtn, this.roomSettingBtn]);
        this.topCheckBox.on("selected", this.onTabBtnHandler, this);
        this.content.add([this.roomInfoBtn, this.roomSettingBtn]);
        this.houseInfoPanel = new PicHouseInfoPanel(this.scene, 0, 0, this.content.width - 40 * this.dpr, this.content.height - 70 * this.dpr, this.key, this.dpr);
        this.content.add(this.houseInfoPanel);
        const btnY = this.content.height * 0.5;
        this.editorRoomBtn = new NineSliceButton(this.scene, 0, btnY - 30 * this.dpr, 100 * this.dpr, 35 * this.dpr, UIAtlasKey.commonKey, "button_g", i18n.t("room_info.editorroom"), this.dpr, this.scale, {
            left: 16 * this.dpr,
            top: 16 * this.dpr,
            right: 16 * this.dpr,
            bottom: 16 * this.dpr
        });
        this.editorRoomBtn.setTextStyle({
            color: "#022B55",
            fontSize: 12 * this.dpr,
            fontFamily: Font.BOLD_FONT
        });
        this.editorRoomBtn.setTextOffset(10 * this.dpr, 0);
        const editorx = -this.editorRoomBtn.width * 0.5 + 8 * this.dpr;
        const eidtorimg = this.scene.make.image({ x: editorx, y: -3 * this.dpr, key: this.key, frame: "renovation" });
        this.editorRoomBtn.add(eidtorimg);
        this.content.add(this.editorRoomBtn);
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
        btn.setTextStyle({ fontFamily: Font.BOLD_FONT, fontSize: 9 * this.dpr, color: "#ffffff" });
        btn.setTextOffset(13 * this.dpr, 0);
        const img = this.scene.make.image({ key: this.key, frame: icon });
        btn.add(img);
        img.x = -btn.width * 0.5 + img.width * 0.5 + 7 * this.dpr;
        return btn;
    }

    private onCloseHandler() {
        this.emit("hide");
    }

    private onEnterEditorHandler() {
        this.emit("scenedecorate");
    }
}
