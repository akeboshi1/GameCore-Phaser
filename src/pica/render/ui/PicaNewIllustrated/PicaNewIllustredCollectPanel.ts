import { GameGridTable, Button, ClickEvent } from "apowophaserui";
import { Handler, Tool, UIHelper, Url, } from "utils";
import { IGalleryCombination } from "picaStructure";
import { UIAtlasName } from "picaRes";
import { DynamicImage } from "gamecoreRender";
export class PicaIllustredCollectPanel extends Phaser.GameObjects.Container {

    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private curSelectItem: IllustratedCollectItem;
    private combinations: IGalleryCombination[];
    private doneMissions: number[] = [];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.setInteractive();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
        this.mGameGrid.setSize(w, h);
        this.mGameGrid.resetMask();
    }
    show() {
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }
    setHandler(send: Handler) {
        this.send = send;
    }

    setCombinationData(content: IGalleryCombination[]) {
        this.mGameGrid.setItems(content);
        this.mGameGrid.layout();
        this.mGameGrid.setT(0);
    }
    setDoneMissionList(list: number[]) {
        if (list) this.doneMissions = list;
        this.mGameGrid.refresh();
    }
    init() {
        const tableHeight = this.height;
        const cellWidth = 326 * this.dpr;
        const cellHeight = 100 * this.dpr;
        const tableConfig = {
            x: 15 * this.dpr,
            y: 0,
            table: {
                width: this.width,
                height: tableHeight,
                columns: 1,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                cellPadX: 0 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = this.mGameGrid.items.length - cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new IllustratedCollectItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                    cellContainer.setHandler(this.send);
                }
                let reweard = false;
                if (this.doneMissions.indexOf(item.id) !== -1) {
                    reweard = true;
                }
                cellContainer.setCombinationData(item, reweard);
                cell.setHeight(cellContainer.height);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.add(this.mGameGrid);
        this.resize();
    }

    private onSelectItemHandler(cell: IllustratedCollectItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
    }
}

class IllustratedCollectItem extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private desTex: Phaser.GameObjects.Text;
    private rewardsBtn: Button;
    private itemIcon: DynamicImage;
    private collectTex: Phaser.GameObjects.Text;
    private dpr: number;
    private zoom: number;
    private combiData: IGalleryCombination;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.background = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_collect_bg_1" });
        this.itemIcon = new DynamicImage(scene, -width * 0.5 + 36 * dpr, 0);
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.x = -this.width * 0.5 + 10 * dpr;
        this.titleTex.y = -this.height * 0.5 + 20 * dpr;
        this.titleTex.setFontStyle("bold");
        this.desTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(0, 0.5);
        this.desTex.x = this.titleTex.x;
        this.desTex.y = this.titleTex.y + 20 * dpr;
        this.collectTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 14) }).setOrigin(1, 0.5);
        this.collectTex.setFontStyle("bold");
        this.collectTex.x = width * 0.5 - 42 * dpr;
        this.rewardsBtn = new Button(this.scene, UIAtlasName.illustrate_new, "illustrate_collect_reward", "illustrate_collect_reward");
        this.rewardsBtn.x = this.width * 0.5 - 10 * this.dpr - this.rewardsBtn.width * 0.5;
        this.rewardsBtn.y = 0;
        this.rewardsBtn.on(ClickEvent.Tap, this.onRewardsHandler, this);
        this.add([this.background, this.itemIcon, this.titleTex, this.desTex, this.collectTex, this.rewardsBtn]);
    }

    public setCombinationData(data: IGalleryCombination, rewarded: boolean) {
        this.combiData = data;
        this.titleTex.text = data.name;
        this.desTex.text = data.des;
        const itemData: any = data.requirement[0];
        const url = Url.getOsdRes(itemData.texturePath);
        this.itemIcon.load(url);
        this.itemIcon.scale = this.dpr / this.zoom;
        const difficults = this.getbgName(data.difficult);
        const color = difficults[0];
        this.background.setFrame(difficults[1]);
        this.collectTex.text = `${data["count"]}/${data.requirement.length}`;
        this.collectTex.setColor(color);
        this.desTex.setColor(color);

    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    private onRewardsHandler() {
        if (this.send) this.send.runWith(["combrewards", this.combiData]);
    }


    private getbgName(difficult: number) {
        let temps;
        switch (difficult) {
            case 1:
                temps = ["#006523", "illustrate_collect_bg_1"];
                break;
            case 2:
                temps = ["#005BAF", "illustrate_collect_bg_2"];
                break;
            case 3:
                temps = ["#692DD6", "illustrate_collect_bg_3"];
                break;
            case 4:
                temps = ["#7C4C00", "illustrate_collect_bg_4"];
                break;
            case 5:
                temps = ["#A50005", "illustrate_collect_bg_5"];
                break;
        }
    }
}
