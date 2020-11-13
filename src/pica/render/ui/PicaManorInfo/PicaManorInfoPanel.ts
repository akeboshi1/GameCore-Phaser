import { PicaManorBasePanel } from "./PicaManorBasePanel";
import { PicaManorChildPanel } from "./PicaManorChildPanel";
import { PicaManorTipsPanel } from "./PicaManorTipsPanel";
import { PicaManorShopPanel } from "./PicaManorShopPanel";
import { BasePanel, Render, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Handler, i18n } from "utils";
export class PicaManorInfoPanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picChildPanel: PicaManorChildPanel;
    private picTipsPanel: PicaManorTipsPanel;
    private picShopPanel: PicaManorShopPanel;
    private manorInfo: any;// IManorBillboardData
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAMANORINFO_NAME;
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
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
        if (this.mShowData)
            this.setManorInfo(this.mShowData);
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "manor/manor.png", "manor/manor.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        this.addAtlas(UIAtlasKey.common3Key, UIAtlasName.textureUrl(UIAtlasName.common3Url), UIAtlasName.jsonUrl(UIAtlasName.common3Url));
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
        this.content = this.scene.make.container(undefined, false);
        this.add(this.content);
        this.resize(wid, hei);
        this.openManorChild();
        super.init();
    }

    public setManorInfo(data: any) {// IManorBillboardData
        this.manorInfo = data;
        if (this.picChildPanel)
            this.picChildPanel.setManorInfoData(data);
    }

    public setShopCategories(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
        if (this.picShopPanel) this.picShopPanel.setShopCategories(content);
    }

    public setShopDatas(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY
        if (this.picShopPanel) this.picShopPanel.setShopDatas(content);
    }

    public setManorTips() {
        this.picTipsPanel.setManorTipsData(i18n.t("manor.successtitle"));
    }
    public destroy() {
        super.destroy();
    }

    private openManorChild() {
        this.showChildPanel();
        this.picChildPanel.setTitleText(i18n.t("manor.landstatus"));
    }

    private openManorShop() {
        this.showShopPanel();
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_getCategories", this.manorInfo.manorIndex);
    }

    private showChildPanel() {
        if (!this.picChildPanel) {
            const wid = 334 * this.dpr;
            const hei = 353 * this.dpr;
            this.picChildPanel = new PicaManorChildPanel(this.scene, this.render, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picChildPanel.setHandler(new Handler(this, (type: number, manorName?: string) => {// number: op_pkt_def.PKT_MANOR_OP
                if (type !== -1) {
                    if (this.manorInfo) {
                        this.render.mainPeer.getUserData_CurRoomID()
                            .then((roomid) => {
                                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_buyeditor", { roomid, index: this.manorInfo.manorIndex, type, manorName });
                            });
                    }
                } else {
                    this.openManorShop();
                    this.hideChildPanel();
                }
            }));
            this.picChildPanel.setCloseHandler(new Handler(this, this.OnCloseHandler));
        }
        this.content.add(this.picChildPanel);
    }

    private hideChildPanel() {
        this.content.remove(this.picChildPanel);
    }

    private showShopPanel() {
        if (!this.picShopPanel) {
            const wid = 334 * this.dpr;
            const hei = 455 * this.dpr;
            this.picShopPanel = new PicaManorShopPanel(this.scene, 0, 0, wid, hei, this.key, this.dpr, this.scale);
            this.picShopPanel.setHandler(new Handler(this, (type: string, data: any) => {
                if (type === "usetype") {
                    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_usingitem", data);
                } else if (type === "buytype") {
                    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_buyItem", data);
                }
            }), new Handler(this, () => {
                this.hideShopPanel();
                this.openManorChild();
            }));
            this.picShopPanel.on("queryProp", (page: number, category: string, subCategory: string) => {
                this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_queryProp", { page, category, subCategory });
            }, this);
        }
        this.content.add(this.picShopPanel);
        this.picShopPanel.refreshMask();
    }

    private hideShopPanel() {
        this.content.remove(this.picShopPanel);
    }

    private OnCloseHandler() {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_hide");
    }
}
