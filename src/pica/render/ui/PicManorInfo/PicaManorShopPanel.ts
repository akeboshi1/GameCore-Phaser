import { NineSlicePatch, Button, ClickEvent, TabButton, NineSliceButton, GameGridTable } from "apowophaserui";
import { DynamicImage, ImageValue, ThreeSliceButton } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { Coin, Color, Font, Handler, i18n, UIHelper, Url } from "utils";
import { SecondaryMenuPanel } from "../PicaBusinessStreet/SecondaryMenuPanel";
export class PicaManorShopPanel extends Phaser.GameObjects.Container {
    private bg: NineSlicePatch;
    private titleText: Phaser.GameObjects.Text;
    private titlebg: Phaser.GameObjects.Image;
    private closeBtn: Button;
    private dpr: number;
    private key: string;
    private closeHandler: Handler;
    private sendHandler: Handler;
    private imgtitle: ImageValue;
    private secondMenu: SecondaryMenuPanel;
    private corfirmButton: NineSliceButton;
    private selectedItem: ManorShopItem;
    private selectedItemData: any;// op_client.IMarketCommodity
    private shopgride: GameGridTable;
    private zoom: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.create();
    }

    refreshMask() {
        this.shopgride.resetMask();
    }
    create() {
        const width = this.width;
        const height = this.height;
        const posY = -height * 0.5;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasKey.common3Key, "bg", UIHelper.background_w(this.dpr));
        this.add(this.bg);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "close");
        this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
        this.closeBtn.setPosition(this.width * 0.5 - 8 * this.dpr, posY + this.dpr * 7);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.add(this.closeBtn);
        this.titlebg = this.scene.make.image({ key: this.key, frame: "tag_single" });
        this.add(this.titlebg);
        this.titlebg.x = -this.width * 0.5 + this.titlebg.width * 0.5 + 0 * this.dpr;
        this.titlebg.y = -this.height * 0.5 - this.titlebg.height * 0.5 + 14 * this.dpr;
        this.imgtitle = new ImageValue(this.scene, 135 * this.dpr, 16 * this.dpr, this.key, "house_shop", this.dpr);
        this.imgtitle.setText(i18n.t("manor.manorshop"));
        this.imgtitle.setFontStyle("bold");
        this.imgtitle.setTextStyle({ fontSize: 15 * this.dpr });
        this.imgtitle.x = this.titlebg.x - 30 * this.dpr;
        this.imgtitle.y = this.titlebg.y;
        this.add(this.imgtitle);
        this.secondMenu = new SecondaryMenuPanel(this.scene, 0, -this.height * 0.5 + 46 * this.dpr, 302 * this.dpr, 29 * this.dpr, this.dpr, this.zoom, {
            x: 0,
            y: -14 * this.dpr,
            width: this.width - 32 * this.dpr,
            height: 30 * this.dpr,
            zoom: this.zoom,
            dpr: this.dpr,
            space: 6 * this.dpr,
            orientation: 1,
            align: 2
        });
        this.secondMenu.setHandler(new Handler(this, this.onTabButtonHandler));
        this.secondMenu.setButtonChangeHandler(new Handler(this, (tab: TabButton) => {
            tab.changeNormal();
            tab.setTextColor("#FE8737");
        }), new Handler(this, (tab: TabButton) => {
            tab.changeDown();
            tab.setTextColor("#ffffff");
        }));
        this.add(this.secondMenu);
        const graW = 302 * this.dpr, graH = 324 * this.dpr, grax = -graW * 0.5, gray = -graH * 0.5 - 20 * this.dpr;
        const graphicbg = this.scene.make.graphics(undefined, false);
        graphicbg.fillStyle(0xFE8737, 1);
        graphicbg.fillRoundedRect(grax, gray, graW, graH, {
            tl: 0, tr: 5 * this.dpr, bl: 5 * this.dpr, br: 5 * this.dpr
        });
        this.add(graphicbg);
        const gridWdith = graW - 16 * this.dpr;
        const gridHeight = 380 * this.dpr;
        const gridY = 12 * this.dpr;
        this.shopgride = this.createGrideTable(0, gridY, gridWdith, gridHeight, 126 * this.dpr, 158 * this.dpr);
        this.corfirmButton = this.createNineButton(UIAtlasKey.commonKey, "yellow_btn_normal", i18n.t("common.confirm"), "#996600");
        this.corfirmButton.y = this.height * 0.5 - this.corfirmButton.height * 0.5 - 15 * this.dpr;
        this.corfirmButton.on(String(ClickEvent.Tap), this.onConfirmButtonHandler, this);
    }
    public setShopCategories(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
        const atts = [];
        for (const category of content.marketCategory) {
            const arr = { text: category.category.value, data: category };
            atts.push(arr);
        }
        this.secondMenu.setCategories(TabButton, atts, {
            width: 97 * this.dpr,
            height: 29 * this.dpr,
            key: this.key,
            normalFrame: "manor_store_uncheck",
            downFrame: "manor_store_check",
            textStyle: {
                fontSize: 15 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#FE8737",
            },
            bold: true
        });
    }

    public setShopDatas(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY
        if (!content.commodities) return;
        const arrs = content.commodities.sort((a, b) => {
            const aid = a.id.replace(/[^0-9]/ig, "");
            const bid = b.id.replace(/[^0-9]/ig, "");
            if (Number(aid) > Number(bid)) return 1;
            else return -1;
        });
        this.shopgride.setItems(arrs);
    }
    public setTitleText(text: string) {
        this.titleText.text = text;
    }
    public setHandler(handler: Handler, close: Handler) {
        this.sendHandler = handler;
        this.closeHandler = close;
    }

    private createNineButton(key: string, frame: string, text: string, color: string) {
        const nineButton = new NineSliceButton(this.scene, 0, 0, 182 * this.dpr, 47 * this.dpr, key, frame, text, this.dpr, this.zoom, {
            left: 14 * this.dpr,
            top: 14 * this.dpr,
            right: 14 * this.dpr,
            bottom: 14 * this.dpr
        });
        this.add(nineButton);
        nineButton.setTextStyle({ fontSize: 21 * this.dpr, fontFamily: Font.DEFULT_FONT, color });
        nineButton.setFontStyle("bold");
        return nineButton;
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number) {
        const tableConfig = {
            x,
            y,
            table: {
                width,
                height,
                columns: 2,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                tableOX: 0 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ManorShopItem(this.scene, 0, 0, capW, capH, this.key, this.dpr);
                    cellContainer.on("buyitem", this.onBuyItemHandler, this);
                    grid.add(cellContainer);
                }
                cellContainer.setItemData(item);
                if (this.selectedItemData && this.selectedItemData.id === item.id) {
                    this.selectedItemData = item;
                    this.selectedItem = cellContainer;
                }
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        grid.on("cellTap", (cell) => {
            if (cell) {
                this.onSelectItemHandler(cell);
            }
        });
        this.add(grid);

        return grid;
    }

    private onTabButtonHandler(data: any) {// op_def.IMarketCategory
        this.emit("queryProp", 1, data.category.key);
    }
    private onConfirmButtonHandler() {
        if (this.selectedItemData && this.selectedItemData.manorState === 1) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_Owned
            if (this.sendHandler) this.sendHandler.runWith(["usetype", this.selectedItemData.id]);
        }
    }
    private onBuyItemHandler(data: any) {// op_client.IMarketCommodity
        const prop = { id: data.id, quantity: 1, category: data.category };
        if (this.sendHandler) this.sendHandler.runWith(["buytype", prop]);
    }
    private onSelectItemHandler(item: ManorShopItem) {
        item.select = true;
        if (this.selectedItem) this.selectedItem.select = false;
        this.selectedItem = item;
        this.selectedItemData = item.shopData;
        if (!this.selectedItem.select) {
            this.selectedItem = undefined;
            this.selectedItemData = undefined;
        }
    }
    private onCloseHandler() {
        if (this.closeHandler) this.closeHandler.run();
    }
}

class ManorShopItem extends Phaser.GameObjects.Container {
    public shopData: any;// op_client.IMarketCommodity
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private nameText: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private button: ThreeSliceButton;
    private tipsText: Phaser.GameObjects.Text;
    private level: Phaser.GameObjects.Text;
    private imgprice: ImageValue;
    private key: string;
    private mselect: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key, frame: "manor_store_icon_bg" });
        this.add(this.bg);
        this.nameText = this.scene.make.text({
            x: 0, y: -this.height * 0.5 + 15 * this.dpr, text: " ",
            style: { color: "#2B2B2B", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5);
        this.add(this.nameText);
        this.icon = new DynamicImage(scene, 0, -20 * dpr, this.key, "floor_01");
        this.add(this.icon);
        const imgvaluebg = this.scene.make.image({ key: this.key, frame: "manor_store_price_bg" });
        this.imgprice = new ImageValue(this.scene, 90 * dpr, 17 * dpr, UIAtlasKey.commonKey, "iv_coin", this.dpr);
        this.imgprice.setLayout(2);
        this.imgprice.setTextStyle({ color: "#000000" });
        this.imgprice.addAt(imgvaluebg, 0);
        this.add(this.imgprice);
        this.tipsText = this.scene.make.text({
            x: 0, y: this.height * 0.5 - 20 * this.dpr, text: i18n.t("manor.owned"),
            style: { color: "#E33922", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5);
        this.tipsText.setFontStyle("bold");
        this.add(this.tipsText);
        this.button = new ThreeSliceButton(scene, 73 * dpr, 26 * dpr, UIAtlasKey.common3Key, UIHelper.threeRedNormal, UIHelper.threeRedNormal, i18n.t("manor.using"));
        this.button.setTextStyle(UIHelper.brownishStyle(dpr));
        this.button.y = this.tipsText.y;
        this.button.on(ClickEvent.Tap, this.onButtonHandler, this);
        this.add(this.button);
        this.imgprice.y = this.button.y - this.button.height * 0.5 - this.imgprice.height * 0.5 - 2 * dpr;

    }

    public setItemData(data: any) {// op_client.IMarketCommodity
        this.shopData = data;
        this.setButtonState(data);
        this.nameText.text = data.name || data.shortName;
        const url = Url.getOsdRes(data.icon);
        this.icon.load(url, this, () => {
            this.icon.scale = this.dpr;
        });
    }

    public set select(value) {
        this.mselect = value;
        this.bg.setFrame(value ? "store_icon_check" : "manor_store_icon_bg");
    }

    public get select() {
        return this.mselect;
    }

    private setButtonState(data: any) {// op_client.IMarketCommodity
        if (data.manorState === 2) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_InUse
            this.button.visible = true;
            this.button.disInteractive();
            this.button.setFrameNormal(UIHelper.threeGreenNormal, UIHelper.threeGreenNormal);
            this.button.setText(i18n.t("manor.using"));
            this.button.setTextColor(Color.black);
            this.tipsText.visible = false;
            this.imgprice.visible = false;
        } else if (data.manorState === 3) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_NotOwned
            this.button.visible = true;
            this.button.setInteractive();
            this.button.setFrameNormal(UIHelper.threeYellowNormal, UIHelper.threeYellowNormal);
            this.button.setText(i18n.t("common.buy"));
            this.button.setTextColor(Color.brownish);
            this.tipsText.visible = false;
            this.imgprice.visible = true;
            const price = data.price[0];
            this.imgprice.setFrameValue(price.price + "", UIAtlasKey.commonKey, Coin.getIcon(price.coinType));
        } else if (data.manorState === 1) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_Owned
            this.button.visible = false;
            this.button.disInteractive();
            this.tipsText.visible = true;
            this.imgprice.visible = false;
        }
    }

    private onButtonHandler() {
        this.emit("buyitem", this.shopData);
    }
}
