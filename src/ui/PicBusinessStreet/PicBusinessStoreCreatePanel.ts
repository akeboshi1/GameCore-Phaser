import { Font } from "../../utils/font";
import { Handler } from "../../Handler/Handler";
import { UIAtlasKey } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { Coin } from "../../utils/resUtil";
import { op_pkt_def } from "pixelpai_proto";
import { BBCodeText, GameGridTable, NineSlicePatch, NineSliceButton, ClickEvent } from "apowophaserui";

export class PicBusinessStoreCreatePanel extends Phaser.GameObjects.Container {
    private recommendedText: Phaser.GameObjects.Text;
    private describleText: Phaser.GameObjects.Text;
    private turnoverText: BBCodeText;
    private gridtable: GameGridTable;
    private coinImg: Phaser.GameObjects.Image;
    private coinBg: Phaser.GameObjects.Image;
    private coinCount: Phaser.GameObjects.Text;
    private describleText2: Phaser.GameObjects.Text;
    private dpr: number;
    private key: string;
    private zoom: number;
    private isFirst: boolean = true;
    private cancelHandler: Handler;
    private selectHandler: Handler;
    private curSelectData: op_pkt_def.IPKT_INDUSTRY | op_pkt_def.PKT_ROOM_MODEL;
    private curSelectItem: StoreTypeItem;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, isfirst: boolean = true) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.isFirst = isfirst;
        this.create();
    }

    public setTypeData(datas: op_pkt_def.IPKT_INDUSTRY[] | op_pkt_def.IPKT_INDUSTRY) {
        if (datas instanceof Array) {
            this.gridtable.setItems(datas);
        } else
            this.gridtable.setItems(datas.roomModels);
        const cells = this.gridtable.getCells();
        const cell = cells[0];
        if (cell && cell.container) {
            this.onGridSelectHandler(cell.container);
        }
        this.gridtable.setT(0);
    }
    public setTypeInfo(data: op_pkt_def.IPKT_INDUSTRY | op_pkt_def.PKT_ROOM_MODEL) {
        this.curSelectData = data;
        if (data instanceof op_pkt_def.PKT_INDUSTRY) {
            this.recommendedText.text = data.state;
            this.describleText.text = data.des;
            this.turnoverText.setText(data.buffDes);
        } else {
            const storeData = <op_pkt_def.PKT_ROOM_MODEL>data;
            if (storeData.price) {
                this.coinImg.setFrame(Coin.getIcon(storeData.price.coinType));
                this.coinCount.text = storeData.price.price + "";
            }
            this.describleText2.text = storeData.des;
        }
    }
    public setHandler(cancel: Handler, select: Handler) {
        this.cancelHandler = cancel;
        this.selectHandler = select;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const titlebg = new NineSlicePatch(this.scene, 0, 0, 135 * this.dpr, 17 * this.dpr, this.key, "subtitle", {
            left: 13 * this.dpr,
            top: 0 * this.dpr,
            right: 13 * this.dpr,
            bottom: 0 * this.dpr
        });
        titlebg.x = 0;
        titlebg.y = posy + 10 * this.dpr;
        this.add(titlebg);
        const title = this.scene.make.text({ x: 0, y: titlebg.y, text: i18n.t("business_street.choosetheindustry"), style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0.5);
        this.add(title);
        const gridWdith = this.width - 24 * this.dpr;
        const gridHeight = 100 * this.dpr;
        const gridY = -50 * this.dpr;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 90 * this.dpr, 100 * this.dpr);
        if (this.isFirst) {
            const mfont = `bold ${13 * this.dpr}px ${Font.BOLD_FONT}`;
            this.recommendedText = this.scene.make.text({ x: 0, y: 20 * this.dpr, text: "Recommended", style: { font: mfont, bold: true, color: "#697AFF" } }).setOrigin(0.5, 0);
            this.add(this.recommendedText);
            this.describleText = this.scene.make.text({ x: 0, y: this.recommendedText.y + this.recommendedText.height + 10 * this.dpr, text: "This industry has great development potential.", style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0.5, 0);
            this.add(this.describleText);
            this.turnoverText = new BBCodeText(this.scene, 0, this.describleText.y + this.describleText.height + 10 * this.dpr)
                .setOrigin(0.5, 0).setFontSize(11 * this.dpr).setFontFamily(Font.DEFULT_FONT).setColor("#0");
            this.add(this.turnoverText);
            title.text = i18n.t("business_street.choosetheindustry");
            titlebg.resize(135 * this.dpr, 17 * this.dpr);
        } else {
            this.coinBg = this.scene.make.image({ key: UIAtlasKey.commonKey, frame: "price_bg" });
            this.coinBg.y = 30 * this.dpr;
            this.add(this.coinBg);
            this.coinImg = this.scene.make.image({ key: UIAtlasKey.commonKey, frame: "iv_coin" });
            this.coinImg.setPosition(this.coinBg.x - this.coinImg.width * 0.5 - 15 * this.dpr, this.coinBg.y);
            this.add(this.coinImg);
            this.coinCount = this.scene.make.text({ x: this.coinImg.x + this.coinImg.width * 0.5 + 10 * this.dpr, y: this.coinImg.y, text: "0", style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0, 0.5);
            this.add(this.coinCount);
            this.describleText2 = this.scene.make.text({
                x: 0, y: this.coinCount.y + 50 * this.dpr,
                text: "55225sadffqwerqwerqwer",
                style: {
                    fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0",
                    wordWrap: {
                        width: 244 * this.dpr,
                        useAdvancedWrap: true
                    }
                }
            }).setOrigin(0.5);
            this.add(this.describleText2);
            title.text = i18n.t("business_street.choosestorelike");
            titlebg.resize(155 * this.dpr, 17 * this.dpr);
        }

        const cancelBtn = new NineSliceButton(this.scene, -60 * this.dpr, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("common.cancel"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(cancelBtn);
        cancelBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        cancelBtn.on(String(ClickEvent.Tap), this.onCancelHandler, this);
        const selectBtn = new NineSliceButton(this.scene, 60 * this.dpr, cancelBtn.y, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("business_street.select"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(selectBtn);
        selectBtn.on(String(ClickEvent.Tap), this.onSelectHandler, this);
        selectBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#996600" });
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number) {
        const tableConfig = {
            x,
            y,
            table: {
                width,
                height,
                columns: 1,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                tableOY: 5 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new StoreTypeItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                }
                cellContainer.setData({ item });
                cellContainer.setStoreData(item);
                if (this.curSelectData && item === this.curSelectData) {
                    cellContainer.select = true;
                } else
                    cellContainer.select = false;
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        grid.on("cellTap", (cell) => {
            if (cell) {
                this.onGridSelectHandler(cell);
            }
        });
        this.add(grid);

        return grid;
    }

    private onGridSelectHandler(cell: StoreTypeItem) {
        this.setTypeInfo(cell.storeData);
        if (this.curSelectItem) this.curSelectItem.select = false;
        cell.select = true;
        this.curSelectItem = cell;
    }

    private onCancelHandler() {
        if (this.cancelHandler) this.cancelHandler.run();
    }

    private onSelectHandler() {
        if (this.selectHandler) this.selectHandler.runWith(this.curSelectData);
    }
}

class StoreTypeItem extends Phaser.GameObjects.Container {
    public storeData: op_pkt_def.IPKT_INDUSTRY | op_pkt_def.PKT_ROOM_MODEL;
    private key: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private bg: Phaser.GameObjects.Image;
    private storeIcon: Phaser.GameObjects.Image;
    private isSelect: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key, frame: "store_bg" });
        this.add(this.bg);

        this.storeIcon = this.scene.make.image({ key, frame: "restaurant_icon" });
        this.storeIcon.setPosition(0, -8 * dpr);
        this.add(this.storeIcon);
        this.storeName = this.scene.make.text({ x: 0, y: this.storeIcon.y + this.storeIcon.height * 0.5 + 10 * dpr, text: "Restaurant", style: { color: "#0", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.storeName);
    }

    public setStoreData(data: op_pkt_def.IPKT_INDUSTRY | op_pkt_def.PKT_ROOM_MODEL) {
        this.storeData = data;
        if (data instanceof op_pkt_def.PKT_INDUSTRY) {
            this.storeIcon.setFrame(data.industryType + "_icon");
            this.storeName.text = data.name;
        } else {
            const storeData = <op_pkt_def.PKT_ROOM_MODEL>data;
            this.storeIcon.setFrame(storeData.storeType + "_icon");
            this.storeName.text = storeData.name;
        }
    }

    public get select() {
        return this.isSelect;
    }
    public set select(value: boolean) {
        this.isSelect = value;
        const frame = value ? "store_bg_click" : "store_bg";
        this.bg.setFrame(frame);
    }
}
