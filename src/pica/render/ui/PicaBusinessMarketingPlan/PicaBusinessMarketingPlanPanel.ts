import { PicaBusinessPlanPanel } from "./PicaBusinessPlanPanel";
import { PicaBusinessChoosePlanPanel } from "./PicaBusinessChoosePlanPanel";
import { BasePanel, UiManager } from "gamecoreRender";
import { PicaBusinessContentPanel } from "../PicaBusinessStreet/PicaBusinessContentPanel";
import { ModuleName, RENDER_PEER } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Handler } from "utils";
export class PicaBusinessMarketingPlanPanel extends BasePanel {
    private key2 = "c_street_2";
    private content: PicaBusinessContentPanel;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picBusinessPlanPanel: PicaBusinessPlanPanel;
    private picChoosePlanPanel: PicaBusinessChoosePlanPanel;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICABUSINESSMARKETINGPLAN_NAME;
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
        this.openPlanPanel();
    }

    public setPlanModels(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN_MODELS_BY_TYPE
        this.picChoosePlanPanel.setPlanData(content.marketPlan);
    }

    public setEquipedPlan(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN
        this.picBusinessPlanPanel.setPlanData(content);
    }

    public destroy() {

        super.destroy();
    }

    private openPlanPanel() {
        this.showMarketingPlanPanel();
        this.picBusinessPlanPanel.setRender(this.render);
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querymarketplan");
    }

    private openChoosePlanPanel() {
        this.showChoosePlanPanel();
        this.picChoosePlanPanel.resetMask();
    }

    private showMarketingPlanPanel() {
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        this.setContentSize(topoffset, bottomoffset);
        if (!this.picBusinessPlanPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picBusinessPlanPanel = new PicaBusinessPlanPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picBusinessPlanPanel.setHandler(new Handler(this, () => {
                this.hideMarketingPlanPanel();
                this.OnCloseHandler();
            }), new Handler(this, (data) => {
                this.hideMarketingPlanPanel();
                this.openChoosePlanPanel();
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryplanmodels", data);
            }));
        }
        this.content.add(this.picBusinessPlanPanel);
        this.picBusinessPlanPanel.resetMask();
    }

    private hideMarketingPlanPanel() {
        this.content.remove(this.picBusinessPlanPanel);
    }

    private showChoosePlanPanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 295 * this.dpr;
        const conHeight = 320 * this.dpr;
        const conY = height * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picChoosePlanPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picChoosePlanPanel = new PicaBusinessChoosePlanPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picChoosePlanPanel.setHandler(new Handler(this, () => {
                this.hideChoosePlanPanel();
                this.openPlanPanel();

            }), new Handler(this, (marketPlanId: string) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryselectplan", marketPlanId);
            }));
        }
        this.content.add(this.picChoosePlanPanel);
        this.picBusinessPlanPanel.resetMask();
    }

    private hideChoosePlanPanel() {
        this.content.remove(this.picChoosePlanPanel);
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
}