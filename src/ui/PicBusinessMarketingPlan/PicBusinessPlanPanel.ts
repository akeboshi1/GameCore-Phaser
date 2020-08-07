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
import { ProgressBar } from "../../../lib/rexui/lib/ui/progressbar/ProgressBar";
import { WorldService } from "../../game/world.service";
import { DynamicImage } from "../components/dynamic.image";

export class PicBusinessPlanPanel extends Phaser.GameObjects.Container {
    private describleText: BBCodeText;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private zoom: number;
    private cancelHandler: Handler;
    private addPlanHandler: Handler;
    private curSelectData: op_pkt_def.IPKT_INDUSTRY | op_pkt_def.PKT_ROOM_MODEL;
    private curSelectItem: MarketingPlanItem;
    private world: WorldService;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }
    public setWorld(world: WorldService) {
        this.world = world;
    }
    public setPlanData(marketPlanPairs: op_client.IMarketPlanPair[]) {
        this.gridtable.setItems(marketPlanPairs);
    }

    public setHandler(cancel: Handler, add: Handler) {
        this.cancelHandler = cancel;
        this.addPlanHandler = add;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const topWid = 253 * this.dpr, topHei = 73 * this.dpr;
        const topbg = new NineSlicePatch(this.scene, 0, 0, topWid, topHei, this.key, "market_b", {
            left: 6 * this.dpr,
            top: 0 * this.dpr,
            right: 6 * this.dpr,
            bottom: 0 * this.dpr
        });
        topbg.y = posy + topHei * 0.5 + 10 * this.dpr;
        this.add(topbg);
        this.describleText = new BBCodeText(this.scene, 0, topbg.y, "This industry has great development potential.", { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" })
            .setOrigin(0.5);
        this.add(this.describleText);
        this.describleText.setWrapWidth(topWid, true);

        const titlebg = new NineSlicePatch(this.scene, 0, 0, 135 * this.dpr, 17 * this.dpr, this.key, "subtitle", {
            left: 13 * this.dpr,
            top: 0 * this.dpr,
            right: 13 * this.dpr,
            bottom: 0 * this.dpr
        });
        titlebg.x = 0;
        titlebg.y = topbg.y + topbg.height * 0.5 + 40 * this.dpr;
        this.add(titlebg);
        const title = this.scene.make.text({ x: 0, y: titlebg.y, text: i18n.t("business_street.marketing_plan"), style: { fontSize: 11 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#0" } }).setOrigin(0.5);
        this.add(title);
        titlebg.resize(135 * this.dpr, 17 * this.dpr);

        const gridWdith = this.width - 24 * this.dpr;
        const gridHeight = this.height - 200 * this.dpr;
        const gridY = titlebg.y + titlebg.height * 0.5 + 20 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 253 * this.dpr, 63 * this.dpr);

        const cancelBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("common.cancel"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(cancelBtn);
        cancelBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        cancelBtn.on(CoreUI.MouseEvent.Tap, this.onCancelHandler, this);
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
                zoom: this.zoom,
                cellPadX: 8 * this.dpr
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MarketingPlanItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                }
                cellContainer.setData({ item });
                cellContainer.setPlanData(item, this.world.clock.unixTime);
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
        this.add(grid);

        return grid;
    }

    private onGridSelectHandler(cell: MarketingPlanItem) {

    }

    private onAddPlanHandler(data: op_client.MarketPlanPair) {
        if (this.addPlanHandler) this.addPlanHandler.runWith(data.marketPlanType);
    }

    private onCancelHandler() {
        if (this.cancelHandler) this.cancelHandler.run();
    }
}

class MarketingPlanItem extends Phaser.GameObjects.Container {
    public planData: op_client.MarketPlanPair;
    private key: string;
    private dpr: number;
    private planName: Phaser.GameObjects.Text;
    private planAtt: BBCodeText;
    private progress: ProgressBar;
    private planText: Phaser.GameObjects.Text;
    private bg: NineSlicePatch;
    private planIcon: DynamicImage;
    private addBtn: Button;
    private addBtnHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, 53 * dpr, this.key, "no_plan_bg", {
            left: 6 * this.dpr,
            top: 0 * this.dpr,
            right: 6 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.add(this.bg);
        const storebg = this.scene.make.image({ key: this.key, frame: "plan_icon_bg" });
        storebg.x = -this.width * 0.5 + storebg.width * 0.5 + 5 * dpr;
        this.add(storebg);
        this.planIcon = new DynamicImage(this.scene, 0, 0);
        this.planIcon.setPosition(storebg.x, -8 * dpr);
        this.add(this.planIcon);
        this.planText = this.scene.make.text({ x: storebg.x + storebg.width * 0.5 + 10 * dpr, y: 0, style: { color: "#0", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.planText.text = i18n.t("business_street.plan_title");
        this.add(this.planText);

        this.planName = this.scene.make.text({ x: storebg.x + storebg.width * 0.5 + 10 * dpr, y: -this.bg.height * 0.5 + 4 * dpr, text: "Plane Name", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.planName);
        this.planAtt = new BBCodeText(this.scene, this.planName.x, this.planName.y + this.planName.height + 4 * dpr, "Competitiveness +10%,  Prosperity +10%", {
            color: "#0",
            fontSize: 10 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0);
        this.add(this.planAtt);
        const barWdith = 159 * dpr, barHeight = 8 * dpr;
        this.progress = new ProgressBar(this.scene, {
            x: 5 * dpr,
            y: this.planAtt.y + this.planAtt.height + 4 * dpr + barHeight * 0.5,
            width: barWdith,
            height: barHeight,
            background: {
                x: 0,
                y: 0,
                width: barWdith,
                height: barHeight,
                config: {
                    top: 1 * dpr,
                    left: 5 * dpr,
                    right: 5 * dpr,
                    bottom: 1 * dpr,
                },
                key,
                frame: "progress_bar_bg"
            },
            bar: {
                x: 0,
                y: 0,
                width: barWdith,
                height: barHeight - dpr,
                config: {
                    top: 1 * dpr,
                    left: 5 * dpr,
                    right: 5 * dpr,
                    bottom: 1 * dpr,
                },
                key,
                frame: "progress_bar_g"
            },
            dpr,
            textConfig: undefined
        });
        this.add(this.progress);
        this.addBtn = new Button(this.scene, this.key, "add_plan", "add_plan");
        this.addBtn.x = this.width * 0.5 - this.addBtn.width * 0.5 - 20 * dpr;
        this.addBtn.on(CoreUI.MouseEvent.Tap, this.onAddBtnHandler, this);
        this.add(this.addBtn);
    }

    public setPlanData(data: op_client.MarketPlanPair, unixTime: number) {
        if (!data.marketPlan) {
            this.planName.visible = false;
            this.planAtt.visible = false;
            this.progress.visible = false;
            this.add(this.addBtn);
            this.bg.setFrame("no_plan_bg");
        } else {
            this.planName.visible = true;
            this.planAtt.visible = true;
            this.progress.visible = true;
            this.planText.visible = false;
            this.bg.setFrame("has_plan_bg");
            this.remove(this.addBtn);
            let barframe = "progress_bar_r";
            const remainTime = data.marketPlan.endTime - unixTime / 1000;
            const ratio = Math.floor(remainTime / data.marketPlan.totalTime * 100);
            if (ratio > 30 && ratio <= 50) barframe = "progress_bar_y";
            else if (ratio > 50) barframe = "progress_bar_g";
            this.progress.bar.setFrame(barframe);
            this.progress.setProgress(remainTime, data.marketPlan.totalTime);
            this.planName.text = data.marketPlan.name;
            this.planAtt.text = data.marketPlan.buffDes;
            const url = Url.getOsdRes(data.marketPlan.icon);
            this.planIcon.load(url, this, () => {
                this.planIcon.displayWidth = 30 * this.dpr;
                this.planIcon.scaleY = this.planIcon.scaleX;
            });
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
