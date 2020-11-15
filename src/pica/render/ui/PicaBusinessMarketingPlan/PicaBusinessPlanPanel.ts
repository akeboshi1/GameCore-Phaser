import { BBCodeText, GameGridTable, NineSlicePatch, NineSliceButton, ProgressBar, Button, ClickEvent } from "apowophaserui";
import { DynamicImage, Render } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n, Url } from "utils";

export class PicaBusinessPlanPanel extends Phaser.GameObjects.Container {
    private planBuffText: BBCodeText;
    private describleText: Phaser.GameObjects.Text;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private zoom: number;
    private cancelHandler: Handler;
    private addPlanHandler: Handler;
    private render: Render;
    private topbg: NineSlicePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }
    public setRender(world: Render) {
        this.render = world;
    }
    public setPlanData(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN
        const marketPlanPairs = content.marketPlanPairs;
        const bg = content.industryBackground !== "" ? content.industryBackground : "market_b";
        this.topbg.setFrame(bg);
        this.describleText.text = content.industryDes;
        this.planBuffText.text = content.industryBuffDes;
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
        this.topbg = new NineSlicePatch(this.scene, 0, 0, topWid, topHei, this.key, "market_b", {
            left: 6 * this.dpr,
            top: 0 * this.dpr,
            right: 6 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.topbg.y = posy + topHei * 0.5 + 10 * this.dpr;
        this.add(this.topbg);
        this.describleText = this.scene.make.text({ x: 0, y: this.topbg.y - 15 * this.dpr, text: "Your store is now at a advantage", style: { fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#ffffff" } }).setOrigin(0.5);
        this.describleText.setWordWrapWidth(200 * this.dpr);
        this.add(this.describleText);
        this.planBuffText = new BBCodeText(this.scene, 0, this.topbg.y + 15 * this.dpr, "Store prosperity -10%", { fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#ffffff" })
            .setOrigin(0.5);
        this.add(this.planBuffText);
        this.planBuffText.setWrapWidth(200 * this.dpr);

        const titlebg = new NineSlicePatch(this.scene, 0, 0, 135 * this.dpr, 17 * this.dpr, this.key, "subtitle", {
            left: 13 * this.dpr,
            top: 0 * this.dpr,
            right: 13 * this.dpr,
            bottom: 0 * this.dpr
        });
        titlebg.x = 0;
        titlebg.y = this.topbg.y + this.topbg.height * 0.5 + 40 * this.dpr;
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
        cancelBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#ffffff" });
        cancelBtn.on(String(ClickEvent.Tap), this.onCancelHandler, this);
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
                    cellContainer.setHandler(new Handler(this, this.onAddPlanHandler));
                }
                cellContainer.setData({ item });
                this.render.mainPeer.requestCurTime().then((t) => {
                    cellContainer.setPlanData(item, t);
                });
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

    private onAddPlanHandler(data: any) {// op_client.MarketPlanPair
        if (this.addPlanHandler) this.addPlanHandler.runWith(data.marketPlanType);
    }

    private onCancelHandler() {
        if (this.cancelHandler) this.cancelHandler.run();
    }
}

class MarketingPlanItem extends Phaser.GameObjects.Container {
    public planData: any;// op_client.MarketPlanPair
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
        storebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        storebg.x = -this.width * 0.5 + storebg.width * 0.5 + 5 * dpr;
        this.add(storebg);
        this.planIcon = new DynamicImage(this.scene, 0, 0);
        this.planIcon.setPosition(storebg.x, 0);
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
        const textConfig = <any>{
            x: 0, y: 0, color: "#ffffff", fontSize: 9 * dpr, fontFamily: Font.DEFULT_FONT, halign: 0.5, valign: 0.5
        };
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
            textConfig
        });
        this.progress.text.setOrigin(0.5);
        this.add(this.progress);
        this.addBtn = new Button(this.scene, this.key, "add_plan", "add_plan");
        this.addBtn.x = this.width * 0.5 - this.addBtn.width * 0.5 - 20 * dpr;
        this.addBtn.on(String(ClickEvent.Tap), this.onAddBtnHandler, this);
        this.add(this.addBtn);
    }

    public setPlanData(data: any, unixTime: number) {// op_client.MarketPlanPair
        if (!data.marketPlan) {
            this.planName.visible = false;
            (<any>this.planAtt).visible = false;
            this.progress.visible = false;
            this.add(this.addBtn);
            this.bg.setFrame("no_plan_bg");
        } else {
            this.planName.visible = true;
            (<any>this.planAtt).visible = true;
            this.progress.visible = true;
            this.planText.visible = false;
            this.bg.setFrame("has_plan_bg");
            this.remove(this.addBtn);
            let barframe = "progress_bar_r";
            const remainTime = Math.floor(data.marketPlan.endTime - unixTime / 1000);
            const ratio = Math.floor(remainTime / data.marketPlan.totalTime * 100);
            if (ratio > 30 && ratio <= 50) barframe = "progress_bar_y";
            else if (ratio > 50) barframe = "progress_bar_g";
            this.progress.bar.setFrame(barframe);
            this.progress.setProgress(remainTime, data.marketPlan.totalTime);
            this.progress.setText(this.getDataFormat(remainTime * 1000));
            this.planName.text = data.marketPlan.name;
            this.planAtt.text = data.marketPlan.buffDes;
            let icon = data.marketPlan.icon !== "" ? data.marketPlan.icon : data.marketPlan.requirements[0].display.texturePath;
            if ((icon === "" || !icon) && data.marketPlan.requirements && data.marketPlan.requirements.length > 0) {
                icon = data.marketPlan.requirements[0].display.texturePath;
            }
            const url = Url.getOsdRes(icon);
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

    private getDataFormat(time: number) {
        const day = Math.floor(time / 86400000);
        const hour = Math.floor(time / 3600000) % 24;
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let text = "";
        if (day > 0) {
            text = `${day}  ${i18n.t("timeuint.day")}`;
            if (hour > 0 || minute > 0) {
                text += `${this.stringFormat(hour)}:${this.stringFormat(minute)}`;
            }
        } else if (hour > 0) {
            if (minute > 0) {
                text = `${this.stringFormat(hour)}:${this.stringFormat(minute)}`;
            } else {
                text = `${this.stringFormat(hour)} ${i18n.t("timeuint.hour")}`;
            }
        } else if (minute > 0) text = `${this.stringFormat(minute)} ${i18n.t("timeuint.minute")}`;
        else text = `${this.stringFormat(second)} ${i18n.t("timeuint.second")}`;
        return text;
    }
    private stringFormat(num: number) {
        let str = num + "";
        if (str.length <= 1) {
            str = "0" + str;
        }
        return str;
    }
}