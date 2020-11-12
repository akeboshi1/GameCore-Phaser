import { GameGridTable, NineSliceButton, ClickEvent, NineSlicePatch } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n } from "utils";

export class PicaBusinessRankingDetailPanel extends Phaser.GameObjects.Container {
    private timeText: Phaser.GameObjects.Text;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private backHandler: Handler;
    private rankRewardHandler: Handler;
    private myRankItem: PicRankingDetailItem;
    private myitembg: Phaser.GameObjects.Image;
    private content: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setRankingDetailData(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL
        this.content = content;
        const arr = content.stores;
        this.gridtable.setItems(arr);
        if (content.playerStore) {
            this.myRankItem.visible = true;
            this.myitembg.visible = true;
            this.myRankItem.setDetailData(content.playerStore);
            const posy = -this.height * 0.5;
            const gridWdith = this.width;
            const gridHeight = this.height - 125 * this.dpr;
            const gridY = posy + 30 * this.dpr + gridHeight * 0.5;
            this.gridtable.y = gridY;
            this.gridtable.setSize(gridWdith, gridHeight);
        } else {
            this.myitembg.visible = false;
            this.myRankItem.visible = false;
            const posy = -this.height * 0.5;
            const gridWdith = this.width;
            const gridHeight = this.height - 100 * this.dpr;
            const gridY = posy + 30 * this.dpr + gridHeight * 0.5;
            this.gridtable.y = gridY;
            this.gridtable.setSize(gridWdith, gridHeight);

        }
        // this.timeText.text = "6 DAY 23:24:16";
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
        this.timeText = this.scene.make.text({ x: 0, y: posy + 6 * this.dpr, text: i18n.t("6 DAY 23:24:16"), style: { fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#D9270F" } }).setOrigin(0.5);
        this.timeText.setStroke("#553100", 2 * this.dpr);
        this.add(this.timeText);
        this.timeText.visible = false;
        const rankRewardBtn = new NineSliceButton(this.scene, 0, this.timeText.y, 60 * this.dpr, 26 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("business_street.rank_reward"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 6 * this.dpr,
            right: 10 * this.dpr,
            bottom: 6 * this.dpr
        });
        rankRewardBtn.x = -posx - rankRewardBtn.width * 0.5 - 30 * this.dpr;
        rankRewardBtn.setTextStyle({ fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#996600" });
        rankRewardBtn.on(String(ClickEvent.Tap), this.onRankRewardHandler, this);
        this.add(rankRewardBtn);
        const gridWdith = this.width;
        const gridHeight = this.height - 125 * this.dpr;
        const gridY = posy + 30 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 50 * this.dpr);
        this.myitembg = this.scene.make.image({ key: this.key2, frame: "my_rank_bg" });
        this.myitembg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.myitembg.y = gridY + gridHeight * 0.5 + this.myitembg.height * 0.5 - 3 * this.dpr;
        this.add(this.myitembg);
        this.myRankItem = new PicRankingDetailItem(this.scene, 0, this.myitembg.y + 5 * this.dpr, 256 * this.dpr, 50 * this.dpr, this.key, this.key2, this.dpr, this.zoom);
        this.add(this.myRankItem);
        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(backBtn);
        backBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#ffffff" });
        backBtn.on(String(ClickEvent.Tap), this.onBackHandler, this);
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
                    cellContainer = new PicRankingDetailItem(this.scene, 0, 0, capW, capH, this.key, this.key2, this.dpr, this.zoom);
                    grid.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setDetailData(item);
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
        this.content = undefined;
    }

    private onRankRewardHandler() {
        if (this.rankRewardHandler) {
            if (this.content) {
                this.rankRewardHandler.runWith([this.content.key, this.content.type]);
            }
        }
    }
}

class PicRankingDetailItem extends Phaser.GameObjects.Container {
    public detailData: any;// op_pkt_def.IPKT_StoreRankItem
    private key: string;
    private key2: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private playerName: Phaser.GameObjects.Text;
    private storeIcon: DynamicImage;
    private rankIcon: Phaser.GameObjects.Image;
    private rankText: Phaser.GameObjects.Text;
    private praiseCount: Phaser.GameObjects.Text;
    private industryIcon: Phaser.GameObjects.Image;
    private bg: NineSlicePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, 45 * dpr, this.key, "restaurant_bg", {
            left: 4 * this.dpr,
            top: 9 * this.dpr,
            right: 4 * this.dpr,
            bottom: 9 * this.dpr
        });
        this.add(this.bg);
        const iconbg = this.scene.make.image({ key: key2, frame: "icon_bg_s" });
        iconbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        iconbg.setPosition(posx + iconbg.width * 0.5 + 3 * dpr, 0);
        this.add(iconbg);
        this.storeIcon = new DynamicImage(this.scene, iconbg.x, 0);
        this.add(this.storeIcon);
        const storeX = iconbg.x + iconbg.width * 0.5 + 10 * dpr;
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 10 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.playerName = this.scene.make.text({ x: storeX, y: this.storeName.y + this.storeName.height * 0.5 + 10 * dpr, text: "Savings: 13000", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.playerName);
        this.industryIcon = this.scene.make.image({ key: this.key2, frame: "restaurant_tag_s" });
        this.industryIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.industryIcon.x = this.width * 0.5 - this.industryIcon.width * 0.5;
        this.add(this.industryIcon);
        this.rankIcon = this.scene.make.image({ key: key2, frame: "1" });
        this.rankIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.rankIcon.x = -posx - 80 * dpr;
        this.add(this.rankIcon);
        this.rankText = this.scene.make.text({ x: storeX, y: 0, text: "Restaurant", style: { color: "#ffffff", fontSize: 18 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.rankText.x = this.rankIcon.x;
        this.add(this.rankText);

        this.praiseCount = this.scene.make.text({ x: this.rankIcon.x + this.rankIcon.width * 0.5 + 10 * dpr, y: this.rankIcon.y, text: "66666666", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.add(this.praiseCount);
    }

    public setDetailData(data: any) {// op_pkt_def.IPKT_StoreRankItem
        this.detailData = data;
        this.storeName.text = data.name;
        this.playerName.text = data.ownerName;
        if (data.index < 4 && data.index > 0) {
            this.rankIcon.visible = true;
            this.rankText.visible = false;
            this.rankIcon.setFrame(data.index + "");
        } else {
            this.rankIcon.visible = false;
            this.rankText.visible = true;
            if (data.index <= 0) {
                this.rankText.text = i18n.t("business_street.onrank");
            } else {
                this.rankText.text = data.index + "";
            }
        }
        this.praiseCount.text = data.value + "";
        this.storeIcon.setTexture(this.key2, data.storeType + "_icon_s");
        this.bg.setFrame(data.industryType + "_bg");
        this.industryIcon.setFrame(data.industryType + "_tag_s");
    }

}
