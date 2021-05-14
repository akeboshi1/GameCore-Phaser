import { NineSlicePatch, Button, ClickEvent, TabButton, NineSliceButton, GameGridTable } from "apowophaserui";
import { DynamicImage, ThreeSliceButton } from "gamecoreRender";
import { Coin, Color, Font, Handler, i18n, UIHelper, Url } from "utils";
import { SecondaryMenuPanel } from "../PicaBusinessStreet/SecondaryMenuPanel";
import { ImageValue } from "..";
import { UIAtlasName } from "picaRes";
import { IDecorateShop } from "picaStructure";
export class PicaRoomDecorateShopPanel extends Phaser.GameObjects.Container {
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
    private leaveButton: NineSliceButton;
    private selectedItem: DecorateShopItem;
    private selectedItemData: any;// op_client.IMarketCommodity
    private shopgride: GameGridTable;
    private curCategory: string;
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
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, UIAtlasName.uicommon1, "bg1", UIHelper.background_w(this.dpr));
        this.add(this.bg);
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
        this.closeBtn.setPosition(this.width * 0.5 - 8 * this.dpr, posY + this.dpr * 7);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.add(this.closeBtn);
        this.titlebg = this.scene.make.image({ key: UIAtlasName.decorateshop, frame: "tag_single" });
        this.add(this.titlebg);
        this.titlebg.x = -this.width * 0.5 + this.titlebg.width * 0.5 + 0 * this.dpr;
        this.titlebg.y = -this.height * 0.5 - this.titlebg.height * 0.5 + 14 * this.dpr;
        this.imgtitle = new ImageValue(this.scene, 135 * this.dpr, 16 * this.dpr, UIAtlasName.decorateshop, "house_shop", this.dpr);
        this.imgtitle.setText(i18n.t("furni_bag.decoratebtn"));
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
        this.leaveButton = this.createNineButton(UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("common.leave"), "#996600");
        this.leaveButton.y = this.height * 0.5 - this.leaveButton.height * 0.5 - 15 * this.dpr;
        this.leaveButton.x = -this.leaveButton.width * 0.5 - 15 * this.dpr;
        this.leaveButton.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.corfirmButton = this.createNineButton(UIAtlasName.uicommon, "button_g", i18n.t("common.save"), "#000000");
        this.corfirmButton.y = this.height * 0.5 - this.corfirmButton.height * 0.5 - 15 * this.dpr;
        this.corfirmButton.x = -this.leaveButton.x;
        this.corfirmButton.on(String(ClickEvent.Tap), this.onConfirmButtonHandler, this);
    }
    public setShopCategories(marketCategory: any[]) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
        const atts = [];
        for (const category of marketCategory) {
            const arr = { text: category.value, data: category };
            atts.push(arr);
        }
        this.secondMenu.setCategories(TabButton, atts, {
            width: 97 * this.dpr,
            height: 29 * this.dpr,
            key: UIAtlasName.decorateshop,
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
        if (!content) return;
        const arrs = content.sort((a, b) => {
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
        const nineButton = new NineSliceButton(this.scene, 0, 0, 123 * this.dpr, 47 * this.dpr, key, frame, text, this.dpr, this.zoom, {
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
                    cellContainer = new DecorateShopItem(this.scene, 0, 0, capW, capH, UIAtlasName.decorateshop, this.dpr);
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
        if (this.curCategory === data.key) return;
        this.emit("queryProp", data.key);
        this.curCategory = data.key;
        if (this.selectedItem) this.selectedItem.select = false;
        this.selectedItem = undefined;
        this.selectedItemData = undefined;
    }
    private onConfirmButtonHandler() {
        if (this.selectedItemData && this.selectedItemData.status === 1) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_Owned
            if (this.sendHandler) this.sendHandler.runWith(["usetype", this.selectedItemData.elementId]);
        }
    }

    private onBuyItemHandler(data: IDecorateShop) {// op_client.IMarketCommodity
        const prop = { id: data.id, quantity: 1, category: data.subcategory, price: data.price[0] };
        if (this.sendHandler) this.sendHandler.runWith(["buytype", prop]);
    }
    private onSelectItemHandler(item: DecorateShopItem) {
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

class DecorateShopItem extends Phaser.GameObjects.Container {
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
        this.nameText = this.scene.make.text({
            x: 0, y: -this.height * 0.5 + 15 * this.dpr, text: " ",
            style: { color: "#2B2B2B", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5);
        this.icon = new DynamicImage(scene, 0, -20 * dpr, this.key, "floor_01");
        const imgvaluebg = this.scene.make.image({ key: this.key, frame: "manor_store_price_bg" });
        this.imgprice = new ImageValue(this.scene, 90 * dpr, 17 * dpr, UIAtlasName.uicommon, "home_silver", this.dpr);
        this.imgprice.setLayout(2);
        this.imgprice.setTextStyle({ color: "#000000" });
        this.imgprice.addAt(imgvaluebg, 0);
        this.tipsText = this.scene.make.text({
            x: 0, y: this.height * 0.5 - 22 * this.dpr, text: i18n.t("manor.owned"),
            style: { color: "#E33922", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5);
        this.tipsText.setFontStyle("bold");
        this.button = new ThreeSliceButton(scene, 73 * dpr, 26 * dpr, UIAtlasName.uicommon, UIHelper.threeRedSmall, UIHelper.threeRedSmall, i18n.t("manor.using"));
        this.button.setTextStyle(UIHelper.brownishStyle(dpr));
        this.button.y = this.tipsText.y + 2 * dpr;
        this.button.on(ClickEvent.Tap, this.onButtonHandler, this);
        this.imgprice.y = this.button.y - this.button.height * 0.5 - this.imgprice.height * 0.5 - 5 * dpr;
        this.add([this.bg, this.nameText, this.icon, this.imgprice, this.tipsText, this.button]);

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
        if (data.status === 2) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_InUse
            this.button.visible = true;
            this.button.disInteractive();
            this.button.setFrameNormal(UIHelper.threeGreenSmall, UIHelper.threeGreenSmall);
            this.button.setText(i18n.t("manor.using"));
            this.button.setTextColor(Color.black);
            this.tipsText.visible = false;
            this.imgprice.visible = false;
        } else if (data.status === 0) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_NotOwned
            this.button.visible = true;
            this.button.setInteractive();
            this.button.setFrameNormal(UIHelper.threeYellowSmall, UIHelper.threeYellowSmall);
            this.button.setText(i18n.t("common.buy"));
            this.button.setTextColor(Color.brownish);
            this.tipsText.visible = false;
            this.imgprice.visible = true;
            const price = data.price[0];
            this.imgprice.setFrameValue(price.price + "", UIAtlasName.uicommon, Coin.getNewIcon(price.coinType));
        } else if (data.status === 1) {// op_pkt_def.PKT_MANOR_COMMODITY_STATE.PKT_MANOR_Owned
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
