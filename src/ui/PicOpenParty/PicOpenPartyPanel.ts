import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { i18n } from "../../i18n";
import { op_client } from "pixelpai_proto";
import { Font } from "../../utils/font";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { CheckboxGroup } from "../components/checkbox.group";
import { NineSlicePatch, NineSliceButton, TabButton, ClickEvent } from "apowophaserui";
import { Handler } from "../../Handler/Handler";
import { ItemsConsumeFunPanel } from "../components/ItemsConsumeFunPanel";
import { PicOpenPartyCreatePanel } from "./PicOpenPartyCreatePanel";
export class PicOpenPartyPanel extends BasePanel {
    private readonly key = "picpartypanel";
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private closeBtn: Phaser.GameObjects.Image;
    private partyBtn: TabButton;
    private settingBtn: TabButton;
    private topCheckBox: CheckboxGroup;
    private partyCreatePanel: PicOpenPartyCreatePanel;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
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
        this.partyCreatePanel.setPartyData(content, username);
        // if (true) {
        //     this.partyBtn.setText(i18n.t("party.partymgr"));
        // }
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
        this.partyCreatePanel = new PicOpenPartyCreatePanel(this.scene, 0, 0, this.content.width - 20 * this.dpr, this.content.height - 70 * this.dpr, this.key, this.dpr);
        this.partyCreatePanel.on("openparty", this.onOpenPartyHandler, this);
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
            this.emit("querytheme");
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
        btn.setTextStyle({ fontFamily: Font.BOLD_FONT, fontSize: 16 * this.dpr, color: "#ffffff" });
        btn.setTextOffset(0, 0);
        return btn;
    }

    private onCloseHandler() {
        this.emit("close");
    }

    private onOpenPartyHandler(topic: string, name: string, des: string, ticket: number) {
        this.emit("queryopen", topic, name, des, ticket);
    }
}
