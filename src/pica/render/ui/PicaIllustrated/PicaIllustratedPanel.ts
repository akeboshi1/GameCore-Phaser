import { ButtonEventDispatcher, CommonBackground, UiManager } from "gamecoreRender";
import { FolderType, UIAtlasName, UILoadType } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, Logger, UIHelper, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaIllustratedListPanel } from "./PicaIllustratedListPanel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaIllustratedDetailPanel } from "./PicaIllustratedDetailPanel";
import { ClickEvent } from "apowophaserui";
import { IExtendCountablePackageItem, IGalleryCombination } from "picaStructure";
import { PicaFuriniDetailPanel } from "./PicaFuriniDetailPanel";
export class PicaIllustratedPanel extends PicaBasePanel {
    private mBackground: CommonBackground;
    private content: Phaser.GameObjects.Container;
    private listPanel: PicaIllustratedListPanel;
    private detailPanel: PicaIllustratedDetailPanel;
    private backButton: ButtonEventDispatcher;
    private titleTex: Phaser.GameObjects.Text;
    private furiDetail: PicaFuriniDetailPanel;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAILLUSTRATED_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.illustrate];
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        this.mBackground.x = w * 0.5;
        this.mBackground.y = h * 0.5;
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        super.resize(w, h);
        this.setSize(w, h);
    }

    public destroy() {
        super.destroy();
        if (this.listPanel) this.listPanel.destroy();
        if (this.detailPanel) this.detailPanel.destroy();
    }

    init() {
        const width = this.scaleWidth, height = this.scaleHeight;
        this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
        this.add(this.mBackground);
        this.backButton = new ButtonEventDispatcher(this.scene, 0, 0);
        this.backButton.setSize(80 * this.dpr, 22 * this.dpr);
        this.backButton.enable = true;
        this.backButton.on(ClickEvent.Tap, this.onCloseHandler, this);
        this.backButton.x = this.backButton.width * 0.5 + 10 * this.dpr;
        this.backButton.y = 45 * this.dpr;
        const closeImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "back_arrow" });
        closeImg.x = -this.backButton.width * 0.5 + closeImg.width * 0.5 + 10 * this.dpr;
        this.titleTex = this.scene.make.text({ text: i18n.t("illustrate.title"), style: UIHelper.whiteStyle(this.dpr, 20) }).setOrigin(0, 0.5);
        this.titleTex.x = closeImg.x + closeImg.width * 0.5 + 15 * this.dpr;
        this.backButton.add([closeImg, this.titleTex]);
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add([this.content, this.backButton]);
        this.resize();
        super.init();
    }

    onShow() {
        this.openListPanel();
    }

    setGallaryData(content: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY, combinations: IGalleryCombination[]) {
        this.tempDatas = { gallery: content, combinations };
        if (!this.mInitialized) return;
        if (this.detailPanel) {
            this.detailPanel.setGallaryData(content, combinations);
        }
    }
    private openListPanel() {
        this.showListPanel();
        this.listPanel.setListData();
    }

    private showListPanel() {
        if (!this.listPanel) {
            this.listPanel = new PicaIllustratedListPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.listPanel.setHandler(new Handler(this, this.onListHandler));
            this.content.add(this.listPanel);
        }
        this.listPanel.visible = true;
        this.titleTex.visible = true;
    }
    private hideListPanel() {
        this.listPanel.visible = false;
    }

    private openDetailPanel() {
        this.showDetailPanel();
        if (this.tempDatas) {
            this.detailPanel.setGallaryData(this.tempDatas.gallery, this.tempDatas.combinations);
        }
    }

    private showDetailPanel() {
        if (!this.detailPanel) {
            this.detailPanel = new PicaIllustratedDetailPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.detailPanel.setHandler(new Handler(this, this.onDetailHandler));
            this.content.add(this.detailPanel);
        }
        this.detailPanel.resize(this.scaleWidth, this.scaleHeight);
        this.detailPanel.visible = true;
        this.titleTex.visible = false;
    }

    private hideDetailPanel() {
        this.detailPanel.visible = false;
    }

    private openFuriDetail(prop: IExtendCountablePackageItem) {
        this.showFuriDetailPanel();
        this.furiDetail.setProp(prop);
    }
    private showFuriDetailPanel() {
        if (!this.furiDetail) {
            this.furiDetail = new PicaFuriniDetailPanel(this.scene, this.render, 334 * this.dpr, 353 * this.dpr, this.dpr, this.scale);
            this.furiDetail.setHandler(new Handler(this, this.onFuriDetailHandler));
        }
        this.content.add(this.furiDetail);
        this.furiDetail.visible = true;
    }

    private hideFuriDetailPanel() {
        this.content.remove(this.furiDetail);
        this.furiDetail.visible = false;
    }

    private onListHandler(tag: string, data?: any) {
        if (tag === "make") {
            this.render.renderEmitter(this.key + "_openmake", data);
        } else if (tag === "gallary") {
            this.hideListPanel();
            this.openDetailPanel();
        }
    }

    private onDetailHandler(tag: string, data: any) {
        if (tag === "close") {
            this.hideDetailPanel();
            this.showListPanel();
        } else if (tag === "rewards") {
            this.render.renderEmitter(this.key + "_queryrewards", data);
        } else if (tag === "combinations") {
            this.render.renderEmitter(this.key + "_querycombinations", data);
        } else if (tag === "furidetail") {
            this.openFuriDetail(data);
        }
    }

    private onFuriDetailHandler() {
        this.hideFuriDetailPanel();
    }
    private onCloseHandler() {
        if (this.detailPanel && this.detailPanel.visible) {
            this.hideDetailPanel();
            // this.openListPanel();
            this.showListPanel();
            return;
        }
        this.render.renderEmitter(this.key + "_close");
    }
}
