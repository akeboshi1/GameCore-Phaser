import { PicaBusinessContentPanel } from "./PicaBusinessContentPanel";
import { PicaBusinessMyStreetPanel } from "./PicaBusinessMyStreetPanel";
import { PicaBusinessStoreCreatePanel } from "./PicaBusinessStoreCreatePanel";
import { PicaBusinessStreetListPanel } from "./PicaBusinessStreetListPanel";
import { PicaBusinessHistoryPanel } from "./PicaBusinessHistoryPanel";
import { PicaBusinessRankingPanel } from "./PicaBusinessRankingPanel";
import { PicaBusinessRankingDetailPanel } from "./PicaBusinessRankingDetailPanel";
import { PicaBusinessRankRewardPanel } from "./PicaBusinessRankRewardPanel";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";
export class PicaBusinessStreetPanel extends BasePanel {
    private key2 = "c_street_2";
    private content: PicaBusinessContentPanel;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picMyStreetPanel: PicaBusinessMyStreetPanel;
    private picStoreCreatePanel: PicaBusinessStoreCreatePanel;
    private picSecondStorePanel: PicaBusinessStoreCreatePanel;
    private picStreetListPanel: PicaBusinessStreetListPanel;
    private picStreetHistoryPanel: PicaBusinessHistoryPanel;
    private picStreetRankingPanel: PicaBusinessRankingPanel;
    private picRankingDetailPanel: PicaBusinessRankingDetailPanel;
    private picRankRewardPanel: PicaBusinessRankRewardPanel;
    private industryModels: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICABUSINESSSTREET_NAME;
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
    }

    public show(param?: any) {
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
        this.setInteractive();
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "c_street_1/c_street_1.png", "c_street_1/c_street_1.json");
        this.addAtlas(this.key2, "c_street_2/c_street_2.png", "c_street_2/c_street_2.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }
    init() {
        const zoom = this.scale;
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x6AE2FF, 0);
        this.mBackGround.fillRect(0, 0, wid * zoom, hei * zoom);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.add(this.mBackGround);
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        const conWidth = 295 * this.dpr;
        const conHeight = hei - topoffset - bottomoffset;
        const conY = topoffset + conHeight * 0.5;
        const conX = wid * 0.5;
        this.content = new PicaBusinessContentPanel(this.scene, conX, conY, conWidth, conHeight, this.dpr, this.key, this.key2);
        this.content.setCloseHandler(new Handler(this, this.OnCloseHandler));
        this.add(this.content);
        this.resize(wid, hei);
        super.init();
        this.setLinear(this.key2);
        this.openMyStreet();
    }

    public setMyStore(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE
        this.picMyStreetPanel.setMyStoreData(content);
    }

    public setCommercialStreet(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET
        if (this.picStreetListPanel)
            this.picStreetListPanel.setStreetListData(content.commercialStreet);
    }
    public setIndustryModels(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS
        this.industryModels = content;
        if (this.picStoreCreatePanel && this.picStoreCreatePanel.parentContainer) {
            this.picStoreCreatePanel.setTypeData(content.industry);
        }
        if (this.picStreetListPanel && this.picStreetListPanel.parentContainer) {
            this.picStreetListPanel.setIndustryModels(this.industryModels);
        }
    }

    public setStoreRankingList(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST
        this.picStreetRankingPanel.setRankingData(content.rankChampions);
    }

    public setStoreRankingDetial(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL
        this.picRankingDetailPanel.setRankingDetailData(content);

    }

    public setStoreRankingReward(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD
        this.picRankRewardPanel.setRankRewardData(content.rewardStage);
    }

    public setEnterHistory(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY
        this.picStreetHistoryPanel.setHistoryeData(content.history);
    }

    public destroy() {

        super.destroy();
    }

    private setSecondStore(datas: any[]) {// op_pkt_def.PKT_ROOM_MODEL
        this.picSecondStorePanel.setTypeData(datas);
    }

    private openMyStreet() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querymystore");
        this.showMyStreetPanel();
        this.content.setTitleText(i18n.t("business_street.commercial_street"));
    }

    private openStoreCreatePanel() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querymodels");
        this.showStoreCreatePanel();
        this.content.setTitleText(i18n.t("business_street.newstore"));
    }

    private openSecondStorePanel() {
        this.showSecondStorePanel();
        this.content.setTitleText(i18n.t("business_street.newstore"));
    }

    private openStoreStreetPanel() {
        this.showStreetListPanel();
        if (this.industryModels) {
            this.picStreetListPanel.setIndustryModels(this.industryModels);
        } else {
            this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querymodels");
        }
        this.content.setTitleText(i18n.t("business_street.commercial_street"));
    }

    private openStreetHistoryPanel() {
        this.showStreetHistoryPanel();
        this.content.setTitleText(i18n.t("business_street.history"));
    }

    private openStreetRankingPanel() {
        this.showStreetRankingPanel();
        this.content.setTitleText(i18n.t("business_street.ranking"));
    }
    private openRankingDetailPanel() {
        this.showRankingDetailPanel();
        this.content.setTitleText(i18n.t("business_street.ranking"));
    }
    private openRankRewardPanel() {
        this.showRankRewardPanel();
        this.content.setTitleText(i18n.t("business_street.rankreward"));
    }

    private showMyStreetPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picMyStreetPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picMyStreetPanel = new PicaBusinessMyStreetPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picMyStreetPanel.setHandler(new Handler(this, () => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryallsaves");
            }), new Handler(this, () => {
                this.openStoreStreetPanel();
                this.hideMyStreetPanel();
            }), new Handler(this, () => {
                this.hideMyStreetPanel();
                this.openStoreCreatePanel();
            }), new Handler(this, (roomid, password) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryenterroom", { roomid, password });
            }));
        }
        this.content.add(this.picMyStreetPanel);
        this.picMyStreetPanel.resetMask();
    }

    private hideMyStreetPanel() {
        this.content.remove(this.picMyStreetPanel);
    }

    private showStoreCreatePanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 295 * this.dpr;
        const conHeight = 320 * this.dpr;
        const conY = height * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picStoreCreatePanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picStoreCreatePanel = new PicaBusinessStoreCreatePanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picStoreCreatePanel.setHandler(new Handler(this, () => {
                this.openMyStreet();
                this.hideStoreCreatePanel();
            }), new Handler(this, (datas) => {
                this.openSecondStorePanel();
                this.hideStoreCreatePanel();
                this.setSecondStore(datas);
            }));
        }
        this.content.add(this.picStoreCreatePanel);
        this.picStoreCreatePanel.resetMask();
    }

    private hideStoreCreatePanel() {
        this.content.remove(this.picStoreCreatePanel);
    }

    private showSecondStorePanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 295 * this.dpr;
        const conHeight = 320 * this.dpr;
        const conY = height * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picSecondStorePanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picSecondStorePanel = new PicaBusinessStoreCreatePanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, false);
            this.picSecondStorePanel.setHandler(new Handler(this, () => {
                this.openStoreCreatePanel();
                this.hideSecondStorePanel();
            }), new Handler(this, (data) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querycreatestore", data.modelId);
            }));
        }
        this.content.add(this.picSecondStorePanel);
        this.picSecondStorePanel.resetMask();
    }

    private hideSecondStorePanel() {
        this.content.remove(this.picSecondStorePanel);
    }

    private showStreetListPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picStreetListPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picStreetListPanel = new PicaBusinessStreetListPanel(this.scene, this.render, 0, 0, wid, hei, this.dpr, this.scale, this.key, this.key2);
            this.picStreetListPanel.setHandler(new Handler(this, () => {
                this.openStreetHistoryPanel();
                this.hideStreetListPanel();
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryenterhistory");
            }), new Handler(this, () => {
                this.openStreetRankingPanel();
                this.hideStreetListPanel();
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryranklist");
            }), new Handler(this, () => {
                this.hideStreetListPanel();
                this.openMyStreet();
            }), new Handler(this, (storeby, storetype) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querystreet", { storeby, storetype });
            }), new Handler(this, (roomid, password) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryenterroom", { roomid, password });
            }));
        }
        this.content.add(this.picStreetListPanel);
        this.picStreetListPanel.resetMask();
    }

    private hideStreetListPanel() {
        this.content.remove(this.picStreetListPanel);
    }

    private showStreetHistoryPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picStreetHistoryPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picStreetHistoryPanel = new PicaBusinessHistoryPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, this.key2);
            this.picStreetHistoryPanel.setHandler(new Handler(this, () => {
                this.hideStreetHistoryPanel();
                this.openStoreStreetPanel();
            }));
        }
        this.content.add(this.picStreetHistoryPanel);
        this.picStreetHistoryPanel.resetMask();
    }

    private hideStreetHistoryPanel() {
        this.content.remove(this.picStreetHistoryPanel);
    }
    private showStreetRankingPanel() {
        const topoffset = 110 * this.dpr;
        const bottomoffset = 94 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picStreetRankingPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picStreetRankingPanel = new PicaBusinessRankingPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, this.key2);
            this.picStreetRankingPanel.setHandler(new Handler(this, () => {
                this.hideStreetRankingPanel();
                this.openStoreStreetPanel();
            }), new Handler(this, (key, type) => {
                this.openRankingDetailPanel();
                this.hideStreetRankingPanel();
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryrankdetail", { key, type });
            }));
        }
        this.content.add(this.picStreetRankingPanel);
        this.picStreetRankingPanel.show();
        this.picStreetRankingPanel.resetMask();
    }

    private hideStreetRankingPanel() {
        this.content.remove(this.picStreetRankingPanel);
        this.picStreetRankingPanel.hide();
    }

    private showRankingDetailPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picRankingDetailPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picRankingDetailPanel = new PicaBusinessRankingDetailPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, this.key2);
            this.picRankingDetailPanel.setHandler(new Handler(this, () => {
                this.hideRankingDetailPanel();
                this.openStreetRankingPanel();
            }), new Handler(this, (key, type) => {
                this.hideRankingDetailPanel();
                this.openRankRewardPanel();
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryrankreward", { key, type });
            }));
        }
        this.content.add(this.picRankingDetailPanel);
        this.picRankingDetailPanel.resetMask();
    }

    private hideRankingDetailPanel() {
        this.content.remove(this.picRankingDetailPanel);
    }

    private showRankRewardPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picRankRewardPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picRankRewardPanel = new PicaBusinessRankRewardPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, this.key2);
            this.picRankRewardPanel.setHandler(new Handler(this, () => {
                this.hideRankRewardPanel();
                this.openRankingDetailPanel();
            }));
        }
        this.content.add(this.picRankRewardPanel);
        this.picRankRewardPanel.resetMask();
    }

    private hideRankRewardPanel() {
        this.content.remove(this.picRankRewardPanel);
    }

    private setContentSize(topoffset: number, bottomoffset: number) {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 295 * this.dpr;
        const conHeight = height - topoffset - bottomoffset;
        const conY = topoffset + conHeight * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
    }

    private OnCloseHandler() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_hide");
    }

    private onSelectItemHandler(item) {

    }

    private getRichLabel(text: string, color = "#2B4BB5") {
        const label = `[stroke=${color}][color=${color}]${text}:[/color][/stroke]`;
        return label;
    }
    private getspaceStr(num: number) {
        let str = "";
        for (let i = 0; i < num; i++) {
            str += " ";
        }
        return str;
    }

}
