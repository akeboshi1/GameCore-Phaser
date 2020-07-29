import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { Handler } from "../../Handler/Handler";
import { DynamicImage } from "../components/dynamic.image";
import { NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { UIAtlasKey } from "../ui.atals.name";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { i18n } from "../../i18n";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";

export class PicBusinessRankingDetailPanel extends Phaser.GameObjects.Container {
    private timeText: Phaser.GameObjects.Text;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private backHandler: Handler;
    private rankRewardHandler: Handler;
    private myRankItem: PicRankingRewardItem;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setRankingData() {
        const arr = new Array(60);
        this.gridtable.setItems(arr);
        this.timeText.text = "6 DAY 23:24:16";
    }

    public setHandler(back: Handler, reward: Handler) {
        this.backHandler = back;
        this.rankRewardHandler = reward;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const mfont = `bold ${13 * this.dpr}px ${Font.BOLD_FONT}`;
        this.timeText = this.scene.make.text({ x: 0, y: posy + 6 * this.dpr, text: i18n.t("6 DAY 23:24:16"), style: { font: mfont, bold: true, color: "#D9270F" } }).setOrigin(0.5);
        this.timeText.setStroke("#553100", 2 * this.dpr);
        this.add(this.timeText);
        const rankRewardBtn = new NineSliceButton(this.scene, 0, this.timeText.y, 55 * this.dpr, 24 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("business_street.rank_reward"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 6 * this.dpr,
            right: 10 * this.dpr,
            bottom: 6* this.dpr
        });
        rankRewardBtn.x = -posx - rankRewardBtn.width * 0.5 - 30 * this.dpr;
        rankRewardBtn.setTextStyle({ fontSize: 8 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#996600" });
        rankRewardBtn.on(CoreUI.MouseEvent.Tap, this.onRankRewardHandler, this);
        this.add(rankRewardBtn);
        const gridWdith = this.width;
        const gridHeight = this.height - 140 * this.dpr;
        const gridY = posy + 50 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 50 * this.dpr);
        const myitembg = this.scene.make.image({ key: this.key2, frame: "my_rank_bg" });
        myitembg.y = gridY + gridHeight * 0.5 + myitembg.height * 0.5 - 20 * this.dpr;
        this.add(myitembg);
        this.myRankItem = new PicRankingRewardItem(this.scene, 0, myitembg.y + 6 * this.dpr, 256 * this.dpr, 50 * this.dpr, this.key, this.key2, this.dpr, this.zoom);
        this.add(this.myRankItem);
        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 15 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(backBtn);
        backBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        backBtn.on(CoreUI.MouseEvent.Tap, this.onBackHandler, this);
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
                tableOX: 19 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicRankingRewardItem(this.scene, 0, 0, capW, capH, this.key, this.key2, this.dpr, this.zoom);
                    grid.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setStoreData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        this.add(grid);
        return grid;
    }

    private onBackHandler() {
        if (this.backHandler) this.backHandler.run();
    }

    private onRankRewardHandler() {
        if (this.rankRewardHandler) this.rankRewardHandler.run();
    }
}

class PicRankingRewardItem extends Phaser.GameObjects.Container {
    public storeData: any;
    private key: string;
    private key2: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private playerName: Phaser.GameObjects.Text;
    private storeIcon: DynamicImage;
    private rankIcon: Phaser.GameObjects.Image;
    private praiseCount: Phaser.GameObjects.Text;
    private industryIcon: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        const bg = new NineSlicePatch(this.scene, 0, 0, width, 45 * dpr, this.key, "resturant_bg", {
            left: 4 * this.dpr,
            top: 9 * this.dpr,
            right: 4 * this.dpr,
            bottom: 9 * this.dpr
        });
        this.add(bg);
        const iconbg = this.scene.make.image({ key: key2, frame: "icon_bg_s" });
        iconbg.setPosition(posx + iconbg.width * 0.5 + 3 * dpr, 0);
        this.add(iconbg);
        this.storeIcon = new DynamicImage(this.scene, iconbg.x, 0);
        this.add(this.storeIcon);
        const storeX = iconbg.x + iconbg.width * 0.5 + 10 * dpr;
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 10 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.playerName = this.scene.make.text({ x: storeX, y: this.storeName.y + this.storeName.height * 0.5 + 10 * dpr, text: "Savings: 13000", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.playerName);
        this.industryIcon = this.scene.make.image({ key: this.key, frame: "entertainment_tag" });
        this.industryIcon.x = this.width * 0.5 - this.industryIcon.width * 0.5;
        this.add(this.industryIcon);
        this.rankIcon = this.scene.make.image({ key: key2, frame: "1" });
        this.rankIcon.x = -posx - 80 * dpr;
        this.add(this.rankIcon);
        this.praiseCount = this.scene.make.text({ x: this.rankIcon.x + this.rankIcon.width * 0.5 + 10 * dpr, y: this.rankIcon.y, text: "66666666", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.add(this.praiseCount);
    }

    public setStoreData(data) {

    }

}
