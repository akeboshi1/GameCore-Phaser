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
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ProgressBar } from "../../../lib/rexui/lib/ui/progressbar/ProgressBar";

export class PicBusinessPlanPanel extends Phaser.GameObjects.Container {
    private describleText: Phaser.GameObjects.Text;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private zoom: number;
    private cancelHandler: Handler;
    private selectHandler: Handler;
    private curSelectData: op_pkt_def.IPKT_INDUSTRY | op_pkt_def.PKT_ROOM_MODEL;
    private curSelectItem: MarketingPlanItem;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, isfirst: boolean = true) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setPlanData() {
        const arr = new Array(60);
        this.gridtable.setItems(arr);
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
        const topWid = 253 * this.dpr, topHei = 73 * this.dpr;
        const topbg = new NineSlicePatch(this.scene, 0, posy + topHei * 0.5 + 20 * this.dpr, topWid, topHei, this.key, "market_b", {
            left: 13 * this.dpr,
            top: 0 * this.dpr,
            right: 13 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.add(topbg);
        this.describleText = this.scene.make.text({ x: 0, y: topbg.y, text: "This industry has great development potential.", style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0.5);
        this.add(this.describleText);
        this.describleText.setWordWrapWidth(topWid, true);

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
        title.text = i18n.t("business_street.choosetheindustry");
        titlebg.resize(135 * this.dpr, 17 * this.dpr);

        const gridWdith = this.width - 24 * this.dpr;
        const gridHeight = 100 * this.dpr;
        const gridY = -50 * this.dpr;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 253 * this.dpr, 53 * this.dpr);

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
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MarketingPlanItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                    this.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setPlanData(item);
                cellContainer.setHandler(new Handler(this, this.onAddPlanHandler));
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
        this.add(grid.table);

        return grid;
    }

    private onGridSelectHandler(cell: MarketingPlanItem) {

    }

    private onAddPlanHandler(data) {

    }

    private onCancelHandler() {
        if (this.cancelHandler) this.cancelHandler.run();
    }

    private onSelectHandler() {
        if (this.selectHandler) this.selectHandler.runWith(this.curSelectData);
    }
}

class MarketingPlanItem extends Phaser.GameObjects.Container {
    public planData: any;
    private key: string;
    private dpr: number;
    private planName: Phaser.GameObjects.Text;
    private planAtt: Phaser.GameObjects.Text;
    private progress: ProgressBar;
    private planText: Phaser.GameObjects.Text;
    private bg: NineSlicePatch;
    private storeIcon: Phaser.GameObjects.Image;
    private addBtn: Button;
    private addBtnHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, height, this.key, "no_plan_bg", {
            left: 13 * this.dpr,
            top: 0 * this.dpr,
            right: 13 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.add(this.bg);
        const storebg = this.scene.make.image({ key: this.key, frame: "store_icon_bg" });
        this.add(storebg);
        this.storeIcon = this.scene.make.image({ key, frame: "restaurant_icon" });
        this.storeIcon.setPosition(0, -8 * dpr);
        this.add(this.storeIcon);
        this.planText = this.scene.make.text({ x: 0, y: 0, text: "Restaurant", style: { color: "#0", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.add(this.planText);

        this.planName = this.scene.make.text({ x: 0, y: 0, text: "Plane Name", style: { color: "#0", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.planName);
        this.planAtt = this.scene.make.text({ x: 0, y: 0, text: "Competitiveness +10%,  Prosperity +10%", style: { color: "#0", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.planAtt);

        this.progress = new ProgressBar(this.scene, {
            x: 48 * dpr / 2,
            y: 15 * dpr,
            width: 41 * dpr,
            height: 4 * dpr,
            background: {
                x: 0,
                y: 0,
                width: 41 * dpr,
                height: 4 * dpr,
                config: {
                    top: 1 * dpr,
                    left: 2 * dpr,
                    right: 2 * dpr,
                    bottom: 1 * dpr,
                },
                key,
                frame: "progress_bar_bg"
            },
            bar: {
                x: 0,
                y: 0,
                width: 41 * dpr,
                height: 4 * dpr,
                config: {
                    top: 1 * dpr,
                    left: 2 * dpr,
                    right: 2 * dpr,
                    bottom: 1 * dpr,
                },
                key,
                frame: "progress_bar_g"
            },
            dpr,
            textConfig: undefined
        });
        this.addBtn = new Button(this.scene, this.key, "add_plan", "add_plan");
        this.addBtn.x = this.width * 0.5 - this.addBtn.width * 0.5 - 20 * dpr;
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddBtnHandler, this);
        this.add(this.addBtn);
    }

    public setPlanData(data) {
        if (!data) {
            this.planName.visible = false;
            this.planAtt.visible = false;
            this.progress.visible = false;
            this.add(this.addBtn);
            this.bg.setFrame("no_plan_bg");
        } else {
            this.planName.visible = true;
            this.planAtt.visible = true;
            this.progress.visible = true;
            this.bg.setFrame("has_plan_bg");
            this.remove(this.addBtn);
        }
        this.planData = data;
    }

    public setHandler(addhandler: Handler) {
        this.addBtnHandler = addhandler;
    }

    private onAddBtnHandler() {
        if (this.addBtnHandler) this.addBtnHandler.runWith(this.planData);
    }
}
