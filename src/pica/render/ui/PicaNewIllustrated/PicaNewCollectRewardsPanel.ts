import { GameGridTable, Button, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { Handler, i18n, Tool, UIHelper, Url, } from "utils";
import { IGalleryCombination } from "picaStructure";
import { UIAtlasName } from "picaRes";
import { DynamicImage, ThreeSliceButton } from "gamecoreRender";
export class PicaNewCollectRewardsPanel extends Phaser.GameObjects.Container {

    private mGameGrid: GameGridTable;
    private confirmBtn: NineSliceButton;
    private backgrand: Phaser.GameObjects.Graphics;
    private titleName: Phaser.GameObjects.Text;
    private closeButton: Button;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private curSelectItem: CollectRewardsItem;
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
        this.mGameGrid.resetMask();
    }
    init() {
        const backWidth = 1.5 * this.width, backheight = 3 * this.height;
        this.backgrand = this.scene.make.graphics(undefined, false);
        this.backgrand.fillStyle(0x000000, 0.66);
        this.backgrand.fillRect(-backWidth * 0.5, -backheight * 0.5, backWidth, backheight);
        this.backgrand.setInteractive(new Phaser.Geom.Rectangle(-backWidth * 0.5, -backheight * 0.5, backWidth, backheight), Phaser.Geom.Rectangle.Contains);
        const bg = new NineSlicePatch(this.scene, 0, 0, this.width, this.height, UIAtlasName.uicommon1, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 30 * this.dpr,
            bottom: 40 * this.dpr
        });
        this.closeButton = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.closeButton.x = this.width * 0.5 - this.closeButton.width * 0.5 + 10 * this.dpr;
        this.closeButton.y = -this.height * 0.5 + this.closeButton.height * 0.5 - 10 * this.dpr;
        this.closeButton.on(ClickEvent.Tap, this.onCloseHandler, this);
        const posY = -bg.height * 0.5 + 3 * this.dpr;
        const titlebg = this.scene.make.image({ x: 0, y: posY, key: UIAtlasName.uicommon1, frame: "title" });
        titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: posY + 3 * this.dpr, text: i18n.t("illustrate.furindetail"),
            style: UIHelper.colorStyle("#905B06", this.dpr * 16)
        }, false).setOrigin(0.5);
        this.titleName.setFontStyle("bold");
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
                    cellContainer = new CollectRewardsItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
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
        this.confirmBtn = new NineSliceButton(this.scene, 0, 70 * this.dpr, 191 * this.dpr, 55 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("common.confirm"), this.dpr, this.zoom, UIHelper.button(this.dpr));
        this.confirmBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmHandler, this);
        this.resize();
    }

    private onSelectItemHandler(cell: CollectRewardsItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
    }

    private onConfirmHandler() {

    }
    private onCloseHandler() {
        if (this.send) this.send.run();
    }
}

class CollectRewardsItem extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private desTex: Phaser.GameObjects.Text;
    private rewardsBtn: ThreeSliceButton;
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
        this.background = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_collect_popup_bg_1" });
        this.itemIcon = new DynamicImage(scene, -width * 0.5 + 36 * dpr, 0);
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.x = -this.width * 0.5 + 10 * dpr;
        this.titleTex.y = -this.height * 0.5 + 20 * dpr;
        this.titleTex.setFontStyle("bold");
        this.desTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(0, 0.5);
        this.desTex.x = this.titleTex.x;
        this.desTex.y = this.titleTex.y + 20 * dpr;
        this.collectTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(1, 0.5);
        this.collectTex.setFontStyle("bold");
        this.collectTex.x = width * 0.5 - 20 * dpr;
        this.collectTex.y = -20 * dpr;
        this.rewardsBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeRedSmall, UIHelper.threeRedSmall, i18n.t("common.receivereward"));
        this.rewardsBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.rewardsBtn.setFontStyle("bold");
        this.rewardsBtn.x = this.collectTex.x;
        this.rewardsBtn.y = 20 * dpr;
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
                temps = ["#006523", "illustrate_collect_popup_bg_1"];
                break;
            case 2:
                temps = ["#005BAF", "illustrate_collect_popup_bg_2"];
                break;
            case 3:
                temps = ["#692DD6", "illustrate_collect_popup_bg_3"];
                break;
            case 4:
                temps = ["#7C4C00", "illustrate_collect_popup_bg_4"];
                break;
            case 5:
                temps = ["#A50005", "illustrate_collect_popup_bg_5"];
                break;
        }
    }
}
