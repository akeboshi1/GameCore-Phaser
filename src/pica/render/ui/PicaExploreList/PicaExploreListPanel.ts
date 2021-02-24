import { op_client } from "pixelpai_proto";
import { CommonBackground, UiManager } from "gamecoreRender";
import { ClickEvent } from "apowophaserui";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaExploreListDetailPanel } from "./PicaExploreListDetailPanel";
import { BackTextButton, EnergyProgressBar } from "../Components";
import { PicaExploreListBottomPanel } from "./PicaExploreListBottomPanel";
import { PicaExploreListLevelPanel } from "./PicaExploreListLevelPanel";

export class PicaExploreListPanel extends PicaBasePanel {
    public levelPanel: PicaExploreListLevelPanel;
    private detialPanel: PicaExploreListDetailPanel;
    private bottomPanel: PicaExploreListBottomPanel;
    private bg: CommonBackground;
    private topbg: Phaser.GameObjects.Image;
    private midbg: Phaser.GameObjects.Image;
    private mBackBtn: BackTextButton;
    private energyProgress: EnergyProgressBar;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.explorelog, UIAtlasName.uicommon1, UIAtlasName.uicommon];
        this.textures = [{ atlasName: "explore_bg_stripe_top", folder: UIAtlasName.explorelog }, { atlasName: "explore_bg_stripe_middle", folder: UIAtlasName.explorelog },
        { atlasName: "explore_mask", folder: UIAtlasName.explorelog }];
        this.key = ModuleName.PICAEXPLORELIST_NAME;
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.bg.x = w * 0.5;
        this.bg.y = h * 0.5;
        this.topbg.y = this.topbg.height * 0.5;
        this.topbg.x = w * 0.5;
        this.midbg.y = this.topbg.y + this.midbg.height * 0.5;
        this.midbg.x = this.topbg.x;
        this.mBackBtn.x = this.mBackBtn.width * 0.5 + 8 * this.dpr;
        this.mBackBtn.y = this.mBackBtn.height * 0.5 + 12 * this.dpr;
        this.energyProgress.x = w - this.energyProgress.width * 0.5 - 17 * this.dpr;
        this.energyProgress.y = this.mBackBtn.y;
        const topHeight = 63 * this.dpr;
        const bottomHeight = 56 * this.dpr;
        const conHeight = h - topHeight - bottomHeight;
        this.levelPanel.x = w * 0.5;
        this.levelPanel.y = topHeight + conHeight * 0.5;
        this.levelPanel.setTopAndBottomHeight(topHeight, bottomHeight);
        this.levelPanel.resize(w, conHeight);
        this.bottomPanel.x = w * 0.5;
        this.bottomPanel.y = h - this.bottomPanel.height * 0.5;
        this.bottomPanel.resize(w, 57 * this.dpr);

    }

    public addListen() {
        if (!this.mInitialized) return;
        this.mBackBtn.on(ClickEvent.Tap, this.onBackHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.mBackBtn.off(ClickEvent.Tap, this.onBackHandler, this);
    }

    init() {
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        const topHeight = 63 * this.dpr;
        const bottomHeight = 56 * this.dpr;
        this.setSize(w, h);
        this.bg = new CommonBackground(this.scene, 0, 0, w, h, UIAtlasName.explorelog, "explore_bg", 0xf6f0dc);
        this.topbg = this.scene.make.image({ key: "explore_bg_stripe_top" });
        this.midbg = this.scene.make.image({ key: "explore_bg_stripe_middle" });
        this.mBackBtn = new BackTextButton(this.scene, this.dpr);
        this.mBackBtn.setText(i18n.t("explore.title"));
        this.energyProgress = new EnergyProgressBar(this.scene, this.dpr);
        const conHeight = h - topHeight - bottomHeight;
        this.levelPanel = new PicaExploreListLevelPanel(this.scene, this.width, conHeight, this.dpr, this.scale);
        this.levelPanel.setHandler(new Handler(this, this.onLevelPanelHandler));
        this.bottomPanel = new PicaExploreListBottomPanel(this.scene, this.width, 57 * this.dpr, this.dpr, this.scale);
        this.bottomPanel.setHandler(new Handler(this, this.onBottomPanelHandler));
        this.add([this.bg, this.topbg, this.midbg, this.levelPanel, this.mBackBtn, this.energyProgress, this.bottomPanel]);
        this.resize(w, h);
        super.init();
    }

    onShow() {
        if (this.mShowData)
            this.setExploreChapters(this.mShowData);
        if (this.tempDatas)
            this.setEnergyData(this.tempDatas.value, this.tempDatas.max);
    }
    setExploreChapterResult(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT) {
        const nextLevelID = this.mShowData.nextLevelId;
        this.levelPanel.setCaptoreResult(content, nextLevelID);
        this.uiManager.render.emitter.emit("PicaExploreListPanel_Data");
    }
    setExploreChapters(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS) {
        this.mShowData = data;
        if (!this.mInitialized) return;
        this.bottomPanel.setChapterDatas(data);
    }

    setEnergyData(value: number, max: number) {
        this.tempDatas = { value, max };
        if (!this.mInitialized) return;
        this.energyProgress.setEnergyData(value, max);
    }

    openDetialPanel() {
        const wid = this.width;
        const hei = this.height;
        if (!this.detialPanel) {
            this.detialPanel = new PicaExploreListDetailPanel(this.scene, wid, hei, this.dpr, this.scale);
            this.detialPanel.setHandler(new Handler(this, this.onDetialHandler));
            this.detialPanel.y = -20 * this.dpr;
        }
        this.add(this.detialPanel);
        this.detialPanel.visible = true;
        this.detialPanel.x = wid * 0.5;
        this.detialPanel.y = hei * 0.5;
        this.detialPanel.resize(wid, hei);
    }

    hideDetailPanel() {
        this.detialPanel.visible = false;
    }
    destroy() {
        super.destroy();
    }

    private onBackHandler() {
        this.render.renderEmitter(ModuleName.PICAEXPLORELIST_NAME + "_hide");
    }

    private onDetialHandler(tag: string, data: any) {
        if (tag === "hide") {
            this.hideDetailPanel();
        }
    }

    private onLevelPanelHandler(tag: string, data: any) {
        if (tag === "foreword") {
            this.openDetialPanel();
            this.detialPanel.setCaptoreResultData(data);
        } else if (tag === "roomid") {
            this.render.renderEmitter(ModuleName.PICAEXPLORELIST_NAME + "_queyenterroom", data);
        } else if (tag === "move") {
            if (data) {
                this.topbg.visible = false;
                this.midbg.visible = false;
            } else {
                this.topbg.visible = true;
                this.midbg.visible = true;
            }
        }
    }
    private onBottomPanelHandler(tag: string, data: any) {
        if (tag === "chapterdata") {
            this.render.renderEmitter(ModuleName.PICAEXPLORELIST_NAME + "_queyexplorechapter", data);
        }
    }

}
