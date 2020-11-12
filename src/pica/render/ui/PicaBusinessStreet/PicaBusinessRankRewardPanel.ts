import { GameGridTable, NineSliceButton, ClickEvent } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n, Url } from "utils";
export class PicaBusinessRankRewardPanel extends Phaser.GameObjects.Container {
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private backHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setRankRewardData(datas: any[]) {// op_client.IPKT_RewardStage
        this.gridtable.setItems(datas);
    }

    public setHandler(back: Handler) {
        this.backHandler = back;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const gridWdith = this.width - 20 * this.dpr;
        const gridHeight = this.height - 70 * this.dpr;
        const gridY = posy + 23 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(-5 * this.dpr, gridY, gridWdith, gridHeight, 256 * this.dpr, 80 * this.dpr);

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
                    cellContainer = new PicRankRewardItem(this.scene, 0, 0, capW, capH, this.key, this.key2, this.dpr, this.zoom);
                    grid.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setRankRewardData(item);
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
}

class PicRankRewardItem extends Phaser.GameObjects.Container {
    public rewardData: any;// op_client.IPKT_RewardStage
    private key: string;
    private key2: string;
    private dpr: number;
    private zoom: number;
    private rankText: Phaser.GameObjects.Text;
    private rankIcon: Phaser.GameObjects.Image;
    private rewardItems: RewardItem[] = [];
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const bg = this.scene.make.image({ key: this.key2, frame: "reward_bg" });
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(bg);
        this.rankIcon = this.scene.make.image({ key: key2, frame: "1" });
        this.rankIcon.x = - width * 0.5 + this.rankIcon.width * 0.5 + 10 * dpr;
        this.add(this.rankIcon);
        const storeX = this.rankIcon.x;
        this.rankText = this.scene.make.text({ x: storeX, y: 0, text: "3", style: { color: "#0", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.rankText);
    }

    public setRankRewardData(data: any) {// op_client.IPKT_RewardStage
        if (this.rewardData === data) return;
        if (data.start === data.end) {
            this.rankIcon.visible = true;
            this.rankText.visible = false;
            this.rankIcon.setFrame(data.start + "");
        } else {
            this.rankIcon.visible = false;
            this.rankText.visible = true;
            this.rankText.text = data.start + "~" + data.end;
        }
        for (const item of this.rewardItems) {
            item.visible = false;
        }
        for (let i = 0; i < data.rewards.length; i++) {
            let item: RewardItem;
            if (i < this.rewardItems.length) {
                item = this.rewardItems[i];
            } else {
                item = new RewardItem(this.scene, 0, 0, 50 * this.dpr, 50 * this.dpr, this.key2, this.dpr, this.zoom);
                this.add(item);
                this.rewardItems.push(item);
            }
            item.visible = true;
            item.setRewardData(data.rewards[i]);
        }
        this.Sort();
        this.rewardData = data;
    }

    private Sort() {
        const space = 10 * this.dpr;
        let value = -50 * this.dpr;
        for (const item of this.rewardItems) {
            item.x = item.width * item.originX + value;
            value += item.width + space;
        }
    }

}

class RewardItem extends Phaser.GameObjects.Container {
    public rewardData: any;
    private key2: string;
    private dpr: number;
    private countText: Phaser.GameObjects.Text;
    private itemIcon: DynamicImage;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key2 = key2;
        this.setSize(width, height);
        const bg = this.scene.make.image({ key: this.key2, frame: "icon_bg_m" });
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(bg);
        this.itemIcon = new DynamicImage(this.scene, 0, 0);
        this.add(this.itemIcon);
        this.countText = this.scene.make.text({ x: bg.width * 0.5, y: bg.height * 0.5, text: "4~10", style: { color: "#0", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(1, 0.5);
        this.add(this.countText);
    }

    public setRewardData(data: any) {// op_client.ICountablePackageItem
        const url = Url.getOsdRes(data.display.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.displayWidth = 43 * this.dpr;
            this.itemIcon.scaleY = this.itemIcon.scaleX;
        });
        this.countText.text = data.count + "";
    }
}
