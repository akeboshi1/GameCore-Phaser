
import { PicaRoomDecorateShopPanel } from "./PicaRoomDecorateShopPanel";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { Handler, i18n } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
export class PicaRoomDecoratePanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picShopPanel: PicaRoomDecorateShopPanel;
    private shopInfo: any;// IManorBillboardData
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAROOMDECORATE_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.decorateshop];
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

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
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
        this.openManorShop();
        super.init();
    }

    public setShopCategories(categorys: any[]) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
        if (this.picShopPanel) this.picShopPanel.setShopCategories(categorys);
    }

    public setShopDatas(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY
        if (this.picShopPanel) this.picShopPanel.setShopDatas(content);
    }
    public destroy() {
        super.destroy();
    }

    private openManorShop() {
        this.showShopPanel();
        this.render.renderEmitter(this.key + "_getCategories");
    }

    private showShopPanel() {
        if (!this.picShopPanel) {
            const wid = 334 * this.dpr;
            const hei = 455 * this.dpr;
            this.picShopPanel = new PicaRoomDecorateShopPanel(this.scene, 0, 0, wid, hei, this.key, this.dpr, this.scale);
            this.picShopPanel.setHandler(new Handler(this, (type: string, data: any) => {
                if (type === "usetype") {
                    this.render.renderEmitter(this.key + "_usingitem", data);
                } else if (type === "buytype") {
                    this.render.renderEmitter(this.key + "_buyItem", data);
                }
            }), new Handler(this, () => {
                this.hideShopPanel();
            }));
            this.picShopPanel.on("queryProp", (page: number, category: string, subCategory: string) => {
                this.render.renderEmitter(this.key + "_queryProp", { page, category, subCategory });
            }, this);
        }
        this.content.add(this.picShopPanel);
        this.picShopPanel.refreshMask();
    }

    private hideShopPanel() {
        this.content.remove(this.picShopPanel);
    }

    private OnCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
