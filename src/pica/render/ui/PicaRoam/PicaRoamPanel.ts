import { UiManager } from "gamecoreRender";
import { FolderType, UIAtlasName, UILoadType } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, Logger, UIHelper, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaRoamListPanel } from "./PicaRoamListPanel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaRoamDrawPanel } from "./PicaRoamDrawPanel";
import { PicaRoamPreviewPanel } from "./PicaRoamPreviewPanel";
import { PicaRoamEffectOnePanel } from "./PicaRoamEffectOnePanel";
export class PicaRoamPanel extends PicaBasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private roamListPanel: PicaRoamListPanel;
    private roamDrawPanel: PicaRoamDrawPanel;
    private roamPreviewPanel: PicaRoamPreviewPanel;
    private roamEffectOnePanel: PicaRoamEffectOnePanel;
    private tokenId: string;
    private isOneDraw: boolean = true;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAROAM_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.roam];
        this.textures = [{ atlasName: "roam_stripe", folder: "roam" }, { atlasName: "roam_topic", folder: "roam" },
        { atlasName: "roamone", folder: "roam_effect", foldType: FolderType.NORMAL, uiType: UILoadType.video },
        { atlasName: "roamtenrepead", folder: "roam_effect", foldType: FolderType.NORMAL, uiType: UILoadType.video },
        { atlasName: "roamreward", folder: "roam_effect", foldType: FolderType.NORMAL, uiType: UILoadType.video },
        { atlasName: "roambefore", folder: "roam_effect", foldType: FolderType.NORMAL, uiType: UILoadType.video }];
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

    public destroy() {
        super.destroy();
        if (this.roamListPanel) this.roamListPanel.destroy();
        if (this.roamDrawPanel) this.roamDrawPanel.destroy();
        if (this.roamPreviewPanel) this.roamPreviewPanel.destroy();
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
        Logger.getInstance().error("PicaRoam+++++++++++++init");
    }

    onShow() {
        this.openRoamList();
        if (this.tempDatas) {
            this.roamListPanel.setRoamDataList(this.tempDatas);
        }
    }

    preload() {
        super.preload();
        Logger.getInstance().error("PicaRoam+++++++++++++preload");
    }
    setRoamDataList(pools: op_client.IDRAW_POOL_STATUS[]) {
        this.tempDatas = pools;
        if (!this.mInitialized) return;
        this.roamListPanel.setRoamDataList(pools);
        if (this.roamDrawPanel) {
            const datas = this.roamListPanel.getRoamTokenDatas();
            this.roamDrawPanel.setRoamDatas(datas);
        }
    }

    openRoamEffectOnePanel(datas: op_client.ICountablePackageItem[]) {
        this.showRoamEffectOnePanel();
        this.roamEffectOnePanel.setRewardDatas(datas, this.isOneDraw);
    }
    hideRoamEffectOnePanel() {
        //  this.content.remove(this.roamEffectOnePanel);
        this.roamEffectOnePanel.visible = false;
    }
    public payDrawHandler(id: string) {
        this.render.renderEmitter(this.key + "_queryroamdraw", id);
        this.isOneDraw = false;
    }

    public setRoamTokenData(money: number, token: number, tokenId: string) {
        if (this.roamDrawPanel) this.roamDrawPanel.setMoneyData(money, token, tokenId);
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
        this.render.renderEmitter(this.key + "_updatepools");
    }
    private hideRoamListPanel() {
        // this.content.remove(this.roamListPanel);
        this.roamListPanel.visible = false;
    }

    private openRoamDrawPanel(data: op_client.IDRAW_POOL_STATUS[]) {
        this.showRoamDrawPanel();
        this.roamDrawPanel.setRoamDatas(data);
        const temp = data[0];
        const obj = { tokenId: temp.tokenId, alterId: temp.alterTokenId };
        this.render.renderEmitter(this.key + "_updatetoken", obj);
        this.tokenId = temp.tokenId;
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
        // this.content.remove(this.roamDrawPanel);
        this.roamDrawPanel.visible = false;
    }

    private showRoamPreviewPanel() {
        if (!this.roamPreviewPanel) {
            this.roamPreviewPanel = new PicaRoamPreviewPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.roamPreviewPanel.setHandler(new Handler(this, this.onRoamPreviewHandler));
        }
        this.content.add(this.roamPreviewPanel);
        this.roamPreviewPanel.visible = true;
        this.roamPreviewPanel.resize(this.scaleWidth, this.scaleHeight);
    }

    private hideRoamPreviewPanel() {
        //  this.content.remove(this.roamPreviewPanel);
        this.roamPreviewPanel.visible = false;
    }

    private showRoamEffectOnePanel() {
        if (!this.roamEffectOnePanel) {
            this.roamEffectOnePanel = new PicaRoamEffectOnePanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr);
            this.roamEffectOnePanel.setHandler(new Handler(this, this.onRoamEffectOneHandler));
        }
        this.content.add(this.roamEffectOnePanel);
        this.roamEffectOnePanel.visible = true;
    }

    private onRoamListHandler(tag: string, data?: any) {
        if (tag === "close") {
            this.onCloseHandler();
        } else if (tag === "roam") {
            this.openRoamDrawPanel(data);
        }
    }

    private onRoamDrawHandler(tag: string, data: any) {
        if (tag === "close") {
            this.hideRoamDrawPanel();
            this.showRoamListPanel();
        } else if (tag === "draw") {
            this.render.renderEmitter(this.key + "_queryroamdraw", data.id);
            this.isOneDraw = data.one;
        } else if (tag === "notice") {
            const tempdata = {
                text: [{ text: data, node: undefined }]
            };
            this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
            return;
        } else if (tag === "pay") {
            const content = UIHelper.createMessageBoxConfig(data.text, i18n.t("roam.title"), this.key, "payDrawHandler", [data.id]);
            this.render.mainPeer.showMediator(ModuleName.PICAMESSAGEBOX_NAME, true, content);
        } else if (tag === "preview") {
            this.showRoamPreviewPanel();
        } else if (tag === "progressrewards") {
            this.render.renderEmitter(this.key + "_queryprogressrewards", data);
        }
    }

    private onRoamPreviewHandler(tag: string, data: any) {
        if (tag === "close") {
            this.hideRoamPreviewPanel();
        }
    }

    private onRoamEffectOneHandler(tag: string) {
        this.render.renderEmitter(this.key + "_queryrareeffect");
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
