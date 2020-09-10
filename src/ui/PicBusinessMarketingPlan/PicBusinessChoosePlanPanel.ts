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
import { Coin, Url } from "../../utils/resUtil";
import { op_def } from "pixelpai_proto";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { DynamicImage } from "../components/dynamic.image";
import { ItemInfoTips } from "../tips/ItemInfoTips";

export class PicBusinessChoosePlanPanel extends Phaser.GameObjects.Container {
    private gridtable: GameGridTable;
    private describleText: Phaser.GameObjects.Text;
    private effectText: Phaser.GameObjects.Text;
    private materialTitle: Phaser.GameObjects.Text;
    private gameScroll: GameScroller;
    private dpr: number;
    private key: string;
    private zoom: number;
    private cancelHandler: Handler;
    private selectHandler: Handler;
    private curSelectData: op_client.MarketPlan;
    private curSelectItem: PlanTypeItem;
    private iteminfoTips: ItemInfoTips;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setPlanData(marketPlan: op_client.IMarketPlan[]) {
        this.gridtable.setItems(marketPlan);
        const cells = this.gridtable.getCells();
        if (cells) {
            const cell = cells[0];
            if (cell && cell.container) {
                this.onGridSelectHandler(cell.container);
            }
        }
    }
    public setHandler(cancel: Handler, select: Handler) {
        this.cancelHandler = cancel;
        this.selectHandler = select;
    }

    public resetMask() {
        this.gridtable.resetMask();
        this.gameScroll.refreshMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const gridWdith = this.width - 29 * this.dpr;
        const gridHeight = 100 * this.dpr;
        const gridY = -this.height * 0.5 + gridHeight * 0.5 + 10 * this.dpr;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 90 * this.dpr, 100 * this.dpr);
        this.describleText = this.scene.make.text({ x: -this.width * 0.5 + 20 * this.dpr, y: gridY + gridHeight * 0.5 + 10 * this.dpr, text: "This industry has great development potential.", style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0);
        this.add(this.describleText);
        this.effectText = this.scene.make.text({
            x: this.describleText.x, y: this.describleText.y + this.describleText.height + 10 * this.dpr,
            text: "55225sadffqwerqwerqwer",
            style: {
                fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0",
                wordWrap: {
                    width: 244 * this.dpr,
                    useAdvancedWrap: true
                }
            }
        }).setOrigin(0);
        this.add(this.effectText);
        this.materialTitle = this.scene.make.text({ x: this.describleText.x, y: this.effectText.y + this.effectText.height + 10 * this.dpr, text: i18n.t("business_street.material_requirements"), style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0);
        this.add(this.materialTitle);

        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: this.materialTitle.y + this.materialTitle.height + 25 * this.dpr,
            width: this.width - 30 * this.dpr,
            height: 60 * this.dpr,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 10 * this.dpr,
            celldownCallBack: (gameobject) => {
                this.iteminfoTips.visible = true;
                this.onMaterialItemHandler(gameobject);
            },
            cellupCallBack: (gameobject) => {
                this.iteminfoTips.visible = false;
            }
        });
        this.add(this.gameScroll);
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
        this.iteminfoTips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasKey.commonKey, "tips_bg", this.dpr);
        this.iteminfoTips.visible = false;
        this.add(this.iteminfoTips);
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
                    cellContainer = new PlanTypeItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                }
                cellContainer.setData({ item });
                cellContainer.setPlanData(item);
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

    private onGridSelectHandler(cell: PlanTypeItem) {
        if (this.curSelectItem) this.curSelectItem.select = false;
        cell.select = true;
        const data = cell.palnData;
        this.gameScroll.clearItems();
        for (const itemdata of data.requirements) {
            const item = new MaterialItem(this.scene, 0, 0, 36 * this.dpr, 36 * this.dpr, this.key, this.dpr, this.zoom);
            item.setItemData(itemdata);
            this.gameScroll.addItem(item);
        }
        this.gameScroll.Sort();
        this.describleText.text = data.des;
        this.effectText.text = i18n.t("business_street.effect") + ":" + data.buffDes;
        this.curSelectItem = cell;
        this.curSelectData = data;
    }

    private onCancelHandler() {
        if (this.cancelHandler) this.cancelHandler.run();
    }

    private onSelectHandler() {
        if (this.selectHandler) this.selectHandler.runWith(this.curSelectData.id);
        this.onCancelHandler();
    }

    private onMaterialItemHandler(gameobj: MaterialItem) {
        const data = gameobj.itemData;
        this.iteminfoTips.setText(this.getDesText(data));
        const worldpos = gameobj.getWorldTransformMatrix();
        const worldpos1 = this.gameScroll.getWorldTransformMatrix();
        this.iteminfoTips.x = worldpos.tx - worldpos1.tx;
        this.iteminfoTips.y = this.gameScroll.y - 20 * this.dpr;
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = data.name + "\n";
        let source = i18n.t("common.source") + ":";
        source += data.source;
        source = `[stroke=#333333][color=#333333]${source}[/color][/stroke]`;
        text += source + "\n";
        if (data.sellingPrice) {
            let price = i18n.t("common.sold");
            price += `${Coin.getName(data.sellingPrice.coinType)} x ${data.sellingPrice.price}`;
            price = `[stroke=#333333][color=#333333]${price}[/color][/stroke]`;
            text += price + "\n";
        }
        if (!data.tradable) {
            let trade = i18n.t("furni_unlock.notrading");
            trade = `[stroke=#333333][color=#ff0000]*${trade}[/color][/stroke]`;
            text += trade;
        }
        return text;
    }
}

class PlanTypeItem extends Phaser.GameObjects.Container {
    public palnData: op_client.MarketPlan;
    private key: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private bg: Phaser.GameObjects.Image;
    private storeIcon: DynamicImage;
    private isSelect: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key, frame: "store_bg" });
        this.add(this.bg);

        this.storeIcon = new DynamicImage(this.scene, 0, 0);
        this.storeIcon.setTexture(this.key, "restaurant_icon");
        this.storeIcon.setPosition(0, -8 * dpr);
        this.add(this.storeIcon);
        this.storeName = this.scene.make.text({ x: 0, y: this.storeIcon.y + this.storeIcon.height * 0.5 + 10 * dpr, text: "Restaurant", style: { color: "#0", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.storeName);
    }

    public setPlanData(data: op_client.MarketPlan) {
        this.palnData = data;
        let icon = data.icon;
        if (icon === "" && data.requirements && data.requirements.length > 0) {
            icon = data.requirements[0].display.texturePath;
        }
        const url = Url.getOsdRes(icon);
        this.storeIcon.load(url, this, () => {
            this.storeIcon.displayWidth = 46 * this.dpr;
            this.storeIcon.scaleY = this.storeIcon.scaleX;
        });
        this.storeName.text = data.name;
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

class MaterialItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private key: string;
    private dpr: number;
    private countText: BBCodeText;
    private itemIcon: DynamicImage;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        const bg = this.scene.make.image({ key: this.key, frame: "item_bg" });
        this.add(bg);
        this.itemIcon = new DynamicImage(this.scene, 0, 0);
        this.add(this.itemIcon);
        this.countText = new BBCodeText(this.scene, bg.width * 0.5, bg.height * 0.5, {})
            .setOrigin(1, 0.5).setFontSize(12 * dpr).setFontFamily(Font.DEFULT_FONT);
        this.add(this.countText);
    }

    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        const url = Url.getOsdRes(data.display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.displayWidth = 29 * this.dpr;
            this.itemIcon.scaleY = this.itemIcon.scaleX;
        });
        this.countText.text = this.getCountText(data.count, data.neededCount);
    }
    private getCountText(count: number, needcount: number) {
        const color = (count >= needcount ? "#0054FF" : "#FF2B2B");
        const countText = `[stroke=${color}][color=${color}]${count}[/color][/stroke]`;
        const needText = `[stroke=#2D2D2D][color=#2D2D2D]/${needcount}[/color][/stroke]`;
        const text = countText + needText;
        return text;
    }
}
