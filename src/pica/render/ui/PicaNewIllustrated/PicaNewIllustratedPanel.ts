import { ButtonEventDispatcher, UiManager } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaNewIllustratedListPanel } from "./PicaNewIllustratedListPanel";
import { op_client } from "pixelpai_proto";
import { PicaNewIllustratedDetailPanel } from "./PicaNewIllustratedDetailPanel";
import { ClickEvent } from "apowophaserui";
import { IExtendCountablePackageItem, IGalleryCombination, IGalleryLevelGroup, IUpdateGalleryDatas, MainUIRedType } from "../../../structure";
import { PicaNewFuriniDetailPanel } from "./PicaNewFuriniDetailPanel";
import { CommonBackground } from "..";
import { PicaNewCombinationPanel } from "./PicaNewCombinationPanel";
import { PicaNewLevelRewardsPanel } from "./PicaNewLevelRewardsPanel";
import { PicaNewAlreadyCollectedPanel } from "./PicaNewAlreadyCollectedPanel";
import { PicaNewCollectBadgePanel } from "./PicaNewCollectBadgePanel";
import { PicaNewCollectRewardsPanel } from "./PicaNewCollectRewardsPanel";
export class PicaNewIllustratedPanel extends PicaBasePanel {
    private mBackground: CommonBackground;
    private content: Phaser.GameObjects.Container;
    private listPanel: PicaNewIllustratedListPanel;
    private detailPanel: PicaNewIllustratedDetailPanel;
    private furiDetail: PicaNewFuriniDetailPanel;
    private combinePanel: PicaNewCombinationPanel;
    private levelRewardsPanel: PicaNewLevelRewardsPanel;
    private alreadyCollectPanel: PicaNewAlreadyCollectedPanel;
    private collectBadgePanel: PicaNewCollectBadgePanel;
    private collectRewardsPanel: PicaNewCollectRewardsPanel;
    private redObj: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAILLUSTRATED_NEW_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.illustrate, UIAtlasName.illustrate_new];
        this.tempDatas = {};
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
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add([this.content]);
        this.resize();
        super.init();
    }

    onShow() {
        this.openListPanel();
        if (this.redObj) this.setRedsState(this.redObj);
    }

    setGallaryData(content: IUpdateGalleryDatas) {
        this.tempDatas["gallery"] = content;
        if (!this.mInitialized) return;
        if (this.detailPanel) {
            this.detailPanel.setGallaryData(content);
        }
    }
    setDisplayCollectDatas(combinations: IGalleryCombination[]) {
        this.tempDatas["combinations"] = combinations;
        if (!this.mInitialized) return;
        if (this.detailPanel) this.detailPanel.setDisplayCollectDatas(combinations);
    }
    setAlreadyCollectDatas(combinations: IGalleryCombination) {
        this.tempDatas["combinations"] = combinations;

    }

    setLevelGalleryGroups(groups: IGalleryLevelGroup[]) {
        this.levelRewardsPanel.setRewardsData(groups);
    }

    setRedsState(obj: any) {
        this.redObj = obj;
        if (!this.mInitialized) return;
        if (this.listPanel) this.listPanel.setRedsState(this.redObj["redlist"]);
        //  if (this.detailPanel) this.detailPanel.setRedsState(this.redObj[MainUIRedType.GALLERY]);

    }
    private openListPanel() {
        this.showListPanel();
        this.listPanel.setListData();
        if (this.redObj) this.listPanel.setRedsState(this.redObj["redlist"]);
    }

    private showListPanel() {
        if (!this.listPanel) {
            this.listPanel = new PicaNewIllustratedListPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.listPanel.setHandler(new Handler(this, this.onListHandler));
            this.content.add(this.listPanel);
        }
        this.listPanel.visible = true;
    }
    private hideListPanel() {
        this.listPanel.visible = false;
    }

    private openDetailPanel() {
        this.showDetailPanel();
        if (this.tempDatas) {
            if (this.tempDatas.gallery) this.detailPanel.setGallaryData(this.tempDatas.gallery);
            if (this.tempDatas.combinations) this.detailPanel.setDisplayCollectDatas(this.tempDatas.combinations);
        }
        if (this.redObj) this.detailPanel.setRedsState(this.redObj[MainUIRedType.GALLERY]);
    }

    private showDetailPanel() {
        if (!this.detailPanel) {
            this.detailPanel = new PicaNewIllustratedDetailPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.detailPanel.setHandler(new Handler(this, this.onDetailHandler));
            this.content.add(this.detailPanel);
        }
        this.detailPanel.resize(this.scaleWidth, this.scaleHeight);
        this.detailPanel.visible = true;
    }

    private hideDetailPanel() {
        this.detailPanel.visible = false;
    }

    private openFuriDetail(prop: IExtendCountablePackageItem, compl?: Handler) {
        this.showFuriDetailPanel(compl);
        this.furiDetail.setProp(prop);
    }
    private showFuriDetailPanel(compl?: Handler) {
        if (!this.furiDetail) {
            this.furiDetail = new PicaNewFuriniDetailPanel(this.scene, this.render, 334 * this.dpr, 353 * this.dpr, this.dpr, this.scale);
            this.furiDetail.setHandler(new Handler(this, () => {
                this.onFuriDetailHandler();
                if (compl) compl.run();
            }));
        }
        this.content.add(this.furiDetail);
        this.furiDetail.visible = true;
        this.furiDetail.refreshMask();
    }

    private hideFuriDetailPanel() {
        this.content.remove(this.furiDetail);
        this.furiDetail.visible = false;
    }

    private openCombinationPanel(data: IGalleryCombination) {
        this.showCombinationPanel();
        this.combinePanel.setGallaryData(data);
    }
    private showCombinationPanel() {
        if (!this.combinePanel) {
            this.combinePanel = new PicaNewCombinationPanel(this.scene, this.render, 334 * this.dpr, 452 * this.dpr, this.dpr, this.scale);
            this.combinePanel.setHandler(new Handler(this, this.onCombinationHandler));
        }
        this.content.add(this.combinePanel);
        this.combinePanel.visible = true;
        this.combinePanel.refreshMask();
    }

    private hideCombinationPanel() {
        this.content.remove(this.combinePanel);
        this.combinePanel.visible = false;
    }

    private openLevelRewardsPanel() {
        this.showLevelRewardsPanel();
        this.render.renderEmitter(this.key + "_getlevelexprewards");
    }
    private showLevelRewardsPanel() {
        if (!this.levelRewardsPanel) {
            this.levelRewardsPanel = new PicaNewLevelRewardsPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.levelRewardsPanel.setHandler(new Handler(this, this.onLevelReceivedHandler));
        }
        this.content.add(this.levelRewardsPanel);
        this.levelRewardsPanel.visible = true;
        this.levelRewardsPanel.refreshMask();
    }

    private hideLevelRewardsPanel() {
        this.content.remove(this.levelRewardsPanel);
        this.levelRewardsPanel.visible = false;
    }

    private openAlreadCollectedPanel() {
        this.showAlreadCollectedPanel();
    }
    private showAlreadCollectedPanel() {
        if (!this.alreadyCollectPanel) {
            this.alreadyCollectPanel = new PicaNewAlreadyCollectedPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.alreadyCollectPanel.setHandler(new Handler(this, this.onAlreadyCollectedHandler));
        }
        this.content.add(this.alreadyCollectPanel);
        this.alreadyCollectPanel.visible = true;
        this.alreadyCollectPanel.refreshMask();
    }

    private hideAlreadCollectedPanel() {
        this.content.remove(this.alreadyCollectPanel);
        this.alreadyCollectPanel.visible = false;
    }

    private openCollectBadgePanel() {
        this.showCollectBadgePanel();
    }
    private showCollectBadgePanel() {
        if (!this.collectBadgePanel) {
            this.collectBadgePanel = new PicaNewCollectBadgePanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.collectBadgePanel.setHandler(new Handler(this, this.onCollectBadgeHandler));
        }
        this.content.add(this.collectBadgePanel);
        this.collectBadgePanel.visible = true;
        this.collectBadgePanel.refreshMask();
    }

    private hideCollectBadgePanel() {
        this.content.remove(this.alreadyCollectPanel);
        this.alreadyCollectPanel.visible = false;
    }
    private openCollectRewardsPanel(data: IGalleryCombination) {
        this.showCollectRewardsPanel();
        this.collectRewardsPanel.setCombinationData(data);
    }
    private showCollectRewardsPanel() {
        if (!this.collectRewardsPanel) {
            this.collectRewardsPanel = new PicaNewCollectRewardsPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.collectRewardsPanel.setHandler(new Handler(this, this.onCollectRewardsHandler));
        }
        this.content.add(this.collectRewardsPanel);
        this.collectRewardsPanel.show();
        this.collectRewardsPanel.refreshMask();
    }

    private hideCollectRewardsPanel() {
        this.content.remove(this.collectRewardsPanel);
        this.collectRewardsPanel.hide();
    }
    private onListHandler(tag: string, data?: any) {
        if (tag === "make") {
            this.render.renderEmitter(this.key + "_openpanel", tag);
        } else if (tag === "gallary") {
            this.hideListPanel();
            this.openDetailPanel();
        } else if (tag === "cooking") {
            this.render.renderEmitter(this.key + "_openpanel", tag);
        } else if (tag === "back") {
            this.onCloseHandler();
        }
    }

    private onDetailHandler(tag: string, data: any) {
        if (tag === "close") {
            this.hideDetailPanel();
            this.showListPanel();
        } else if (tag === "combinations") {
            this.openCombinationPanel(data);
        } else if (tag === "furidetail") {
            this.openFuriDetail(data);
            if (data.status === 1) this.render.renderEmitter(this.key + "_changeGalleryStatus", data.id);
        } else if (tag === "displaycollect") {
            this.render.renderEmitter(this.key + "_getdisplatcollectedlist");
        } else if (tag === "badgerewards") {
            this.openCollectBadgePanel();
        } else if (tag === "showlevelrewards") {
            this.openLevelRewardsPanel();
            this.hideDetailPanel();
        } else if (tag === "showcombination") {
            this.openCombinationPanel(data);
            this.hideDetailPanel();
        } else if (tag === "combinationrewards") {
            this.openCollectRewardsPanel(data);
            this.hideDetailPanel();
        } else if (tag === "showalreadycollected") {
            this.openAlreadCollectedPanel();
        } else if (tag === "getlightrewardsd") {
            this.render.renderEmitter(this.key + "_getgallerylightrewards", data);
        }
    }

    private onCombinationHandler(tag: string, data: any) {
        if (tag === "furidetail") {
            this.hideCombinationPanel();
            this.openFuriDetail(data, new Handler(this, () => {
                this.showCombinationPanel();
            }));
        } else if (tag === "close") {
            this.hideCombinationPanel();
            this.showDetailPanel();
        }
    }

    private onLevelReceivedHandler(tag: string, data: any) {
        if (tag === "back") {
            this.hideLevelRewardsPanel();
            this.showDetailPanel();
        } else if (tag === "rewards") {
            this.render.renderEmitter(this.key + "_getgalleryexprewards", data);
        } else if (tag === "allrewards") {
            this.render.renderEmitter(this.key + "_getallgalleryrewards");
        }
    }

    private onAlreadyCollectedHandler(tag: string, data: any) {

    }

    private onCollectBadgeHandler(tag: string, data: any) {

    }
    private onCollectRewardsHandler(tag: string, data: any) {
        if (tag === "close") {
            this.hideCollectRewardsPanel();
            this.showDetailPanel();
        } else if (tag === "combrewards") {
            this.render.renderEmitter(this.key + "_getgatheringrewards", { id: data.id, index: data.indexed });
        }
    }

    private onFuriDetailHandler() {
        this.hideFuriDetailPanel();
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
}