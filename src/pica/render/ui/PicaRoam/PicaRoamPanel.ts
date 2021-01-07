import { UiManager } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaRoamListPanel } from "./PicaRoamListPanel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaRoamDrawPanel } from "./PicaRoamDrawPanel";
export class PicaRoamPanel extends PicaBasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private roamListPanel: PicaRoamListPanel;
    private roamDrawPanel: PicaRoamDrawPanel;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAROAM_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.roam];
        this.textures = [{ atlasName: "roam_stripe", folder: "roam" }, { atlasName: "roam_topic", folder: "roam" }];
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.5);
        this.mBackground.fillRoundedRect(-this.x, -this.y, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    public addListen() {
        if (!this.mInitialized) return;

    }

    public removeListen() {
        if (!this.mInitialized) return;

    }

    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        //   this.mBackground.on("pointerup", this.OnClosePanel, this);
        this.add(this.mBackground);
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.resize();
        super.init();
    }

    onShow() {
        this.openRoamList();
        if (this.tempDatas) {
            this.roamListPanel.setRoamDataList(this.tempDatas);
        }
    }

    setRoamDataList(pools: op_client.IDRAW_POOL_STATUS[]) {
        this.tempDatas = pools;
        if (!this.mInitialized) return;
        this.roamListPanel.setRoamDataList(pools);
    }

    private openRoamList() {
        this.showRoamListPanel();
    }

    private showRoamListPanel() {
        if (!this.roamListPanel) {
            this.roamListPanel = new PicaRoamListPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.roamListPanel.setHandler(new Handler(this, this.onRoamListHandler));
        }
        this.content.add(this.roamListPanel);
        this.roamListPanel.visible = true;
        this.roamListPanel.resize(this.scaleWidth, this.scaleHeight);
    }
    private hideRoamListPanel() {
        this.content.remove(this.roamListPanel);
        this.roamListPanel.visible = false;
    }

    private openRoamDrawPanel(data: op_client.IDRAW_POOL_STATUS[]) {
        this.showRoamDrawPanel();
        this.roamDrawPanel.setRoamDatas(data);
    }

    private showRoamDrawPanel() {
        if (!this.roamDrawPanel) {
            this.roamDrawPanel = new PicaRoamDrawPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.roamDrawPanel.setHandler(new Handler(this, this.onRoamDrawHandler));
        }
        this.content.add(this.roamDrawPanel);
        this.roamDrawPanel.visible = true;
        this.roamDrawPanel.resize(this.scaleWidth, this.scaleHeight);
    }

    private hideRoamDrawPanel() {
        this.content.remove(this.roamDrawPanel);
        this.roamDrawPanel.visible = false;
    }

    private onRoamListHandler(tag: string, data?: any) {
        if (tag === "close") {
            this.onCloseHandler();
        } else if (tag === "roam") {
            this.openRoamDrawPanel(data);
        }
    }

    private onRoamDrawHandler(tag: string, data: op_client.IDRAW_POOL_STATUS) {
        if (tag === "close") {
            this.hideRoamDrawPanel();
            this.showRoamListPanel();
        } else if (tag === "roam") {

        }
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
