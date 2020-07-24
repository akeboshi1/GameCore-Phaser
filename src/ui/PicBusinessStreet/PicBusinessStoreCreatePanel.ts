import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { Handler } from "../../Handler/Handler";
import { NineSlicePatch, BBCodeText } from "../../../lib/rexui/lib/ui/ui-components";
import { UIAtlasKey } from "../ui.atals.name";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { i18n } from "../../i18n";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { Coin } from "../../utils/resUtil";
import { op_def } from "pixelpai_proto";

export class PicBusinessStoreCreatePanel extends Phaser.GameObjects.Container {
    private recommendedText: Phaser.GameObjects.Text;
    private describleText: Phaser.GameObjects.Text;
    private prosperityText: BBCodeText;
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
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, isfirst: boolean = true) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.isFirst = isfirst;
        this.create();
    }

    public setStoreTypeData() {
        const arr = new Array(60);
        this.gridtable.setItems(arr);
        if (this.isFirst) {
            this.recommendedText.text = "Recommended";
            this.describleText.text = "This industry has great development potential.";
            this.prosperityText.setText("Store prosperity [color=#52BC04]+10%[/color]");
        } else {
            this.coinImg.setFrame(Coin.getIcon(op_def.CoinType.COIN));
            this.coinCount.text = "60000";
            this.describleText2.text = "wqerwqerqwerqfdgsdsdflgjsdgjwpioerjhtiowertjiowertiowhertiowherthweoirthwoierhtoiwerhtiowerhtoiwerhtoiwehrtiowhertiowhertoiwedsfgnfdgnosdfghiweorhtioerwhtwoierhtwoiret";
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
            this.prosperityText = new BBCodeText(this.scene, 0, this.describleText.y + this.describleText.height + 10 * this.dpr)
                .setOrigin(0.5, 0).setFontSize(11 * this.dpr).setFontFamily(Font.DEFULT_FONT).setColor("#0");
            this.add(this.prosperityText);
            title.text = i18n.t("business_street.choosetheindustry");
            titlebg.resize(135 * this.dpr, 17 * this.dpr);
        } else {
            this.coinBg = this.scene.make.image({ key: UIAtlasKey.commonKey, frame: "price_bg" });
            this.coinBg.y = 30 * this.dpr;
            this.add(this.coinBg);
            this.coinImg = this.scene.make.image({ key: UIAtlasKey.commonKey, frame: "iv_coin" });
            this.coinImg.setPosition(this.coinBg.x - this.coinImg.width * 0.5 - 15 * this.dpr, this.coinBg.y);
            this.add(this.coinImg);
            this.coinCount = this.scene.make.text({ x: this.coinImg.x + this.coinImg.width * 0.5 + 10 * this.dpr, y: this.coinImg.y, text: "10000000", style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0, 0.5);
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
        cancelBtn.on(CoreUI.MouseEvent.Tap, this.onCancelHandler, this);
        const selectBtn = new NineSliceButton(this.scene, 60 * this.dpr, cancelBtn.y, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("business_street.select"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(selectBtn);
        selectBtn.on(CoreUI.MouseEvent.Tap, this.onSelectHandler, this);
        selectBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#996600" });
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number) {
        const tableConfig: GridTableConfig = {
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
                    this.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setStoreData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        this.add(grid.table);

        return grid;
    }

    private onCancelHandler() {
        if (this.cancelHandler) this.cancelHandler.run();
    }

    private onSelectHandler() {
        if (this.selectHandler) this.selectHandler.run();
    }
}

class StoreTypeItem extends Phaser.GameObjects.Container {
    public storeData: any;
    private key: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private bg: Phaser.GameObjects.Image;
    private storeIcon: Phaser.GameObjects.Image;
    private enterHandler: Handler;
    private isSelect: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key, frame: "store_bg" });
        this.add(this.bg);

        this.storeIcon = this.scene.make.image({ key, frame: "resturant_icon" });
        this.storeIcon.setPosition(0, -8 * dpr);
        this.add(this.storeIcon);
        this.storeName = this.scene.make.text({ x: 0, y: this.storeIcon.y + this.storeIcon.height * 0.5 + 18 * dpr, text: "Restaurant", style: { color: "#0", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.storeName);
    }

    public setStoreData(data) {

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
