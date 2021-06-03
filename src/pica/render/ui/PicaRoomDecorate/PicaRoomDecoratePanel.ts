
import { PicaRoomDecorateShopPanel } from "./PicaRoomDecorateShopPanel";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { CoinType, Handler, i18n } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { UIAtlasName } from "picaRes";
import { MoneyCompent } from "..";
export class PicaRoomDecoratePanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBackGround: Phaser.GameObjects.Graphics;
    private moneycomp: MoneyCompent;
    private moneyValue: number;
    private diamondValue: number;
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
        this.mBackGround.fillStyle(0x000000, 0.88);
        this.mBackGround.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.moneycomp.x = w - 20 * this.dpr;
        this.moneycomp.y = this.moneycomp.height * 0.5 + 50 * this.dpr;
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
        this.moneycomp = new MoneyCompent(this.scene, 190 * this.dpr, 28 * this.dpr, this.dpr, this.scale);
        this.add(this.moneycomp);
        this.resize(wid, hei);
        this.openManorShop();
        super.init();
    }
    onShow() {
        this.setMoneyData(this.moneyValue, this.diamondValue);
    }
    public setMoneyData(money: number, diamond: number) {
        this.moneyValue = money;
        this.diamondValue = diamond;
        if (!this.mInitialized) return;
        this.moneycomp.setMoneyData(money, diamond);
    }
    public setShopCategories(categorys: any[]) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
        if (this.picShopPanel) this.picShopPanel.setShopCategories(categorys);
    }

    public setShopDatas(content: any, category) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY
        if (this.picShopPanel) this.picShopPanel.setShopDatas(content, category);
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
                    let noticetext;
                    if (data.status === 1) {
                        this.render.renderEmitter(this.key + "_usingitem", data);
                        this.onCloseHandler();
                        noticetext = i18n.t("roomdecorate.savetips", { type: data.type, name: data.name });
                    } else if (data.status === 0) {
                        noticetext = i18n.t("roomdecorate.usetips", { name: data.type });
                    } else if (data.status === 2) {
                        noticetext = i18n.t("roomdecorate.usering", { name: data.type });
                        this.onCloseHandler();
                    }
                    if (noticetext) {
                        const tempdata = {
                            text: [{ text: noticetext, node: undefined }]
                        };
                        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
                    }
                } else if (type === "buytype") {
                    const haveValue = data.price.coinType === CoinType.DIAMOND ? this.diamondValue : this.moneyValue;
                    if (data.price.price > haveValue) {
                        const tempdata = {
                            text: [{ text: i18n.t("market.moneyless"), node: undefined }]
                        };
                        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
                    } else {
                        this.render.renderEmitter(this.key + "_buyItem", data);
                    }
                }
            }), new Handler(this, () => {
                this.hideShopPanel();
            }));
            this.picShopPanel.on("queryProp", (subCategory: string) => {
                this.render.renderEmitter(this.key + "_queryMarket", subCategory);
            }, this);
        }
        this.content.add(this.picShopPanel);
        this.picShopPanel.refreshMask();
    }

    private hideShopPanel() {
        this.onCloseHandler();
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
