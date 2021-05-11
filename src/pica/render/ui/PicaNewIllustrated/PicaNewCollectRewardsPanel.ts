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
    private combinations: IGalleryCombination;
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
        this.mGameGrid.resetMask();
    }
    refreshMask() {
        this.mGameGrid.resetMask();
    }
    show() {
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }
    close() {
        this.onCloseHandler();
    }
    setHandler(send: Handler) {
        this.send = send;
    }
    updateCombination(content: IGalleryCombination) {
        if (this.combinations && this.combinations.id === content.id) {
            this.setCombinationData(content);
        }
    }
    checkHasCombination(content: IGalleryCombination) {
        return this.combinations && this.combinations.id === content.id;
    }
    setCombinationData(content: IGalleryCombination) {
        this.combinations = content;
        this.mGameGrid.setItems(content.rewardItems);
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
            x: 0, y: posY + 3 * this.dpr, text: i18n.t("illustrate.collectrewards"),
            style: UIHelper.colorStyle("#905B06", this.dpr * 16)
        }, false).setOrigin(0.5);
        this.titleName.setFontStyle("bold");
        const tableHeight = 318 * this.dpr;
        const tableWidth = 298 * this.dpr;
        const cellWidth = 298 * this.dpr;
        const cellHeight = 80 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: tableWidth,
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
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new CollectRewardsItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                    cellContainer.setHandler(this.send);
                }
                cellContainer.setCombinationData(this.combinations, index+1);
                cell.setHeight(cellContainer.height);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.mGameGrid.y = -30 * this.dpr;
        this.confirmBtn = new NineSliceButton(this.scene, 0, 0, 127 * this.dpr, 37 * this.dpr, UIAtlasName.uicommon, "yellow_btn_normal", i18n.t("common.confirm"), this.dpr, this.zoom, UIHelper.button(this.dpr));
        this.confirmBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 23));
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmHandler, this);
        this.confirmBtn.y = this.height * 0.5 - this.confirmBtn.height * 0.5 - 32 * this.dpr;
        this.add([this.backgrand, bg, this.closeButton, titlebg, this.titleName, this.mGameGrid, this.confirmBtn]);
        this.resize();
    }

    private onSelectItemHandler(cell: CollectRewardsItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
    }

    private onConfirmHandler() {
        this.onCloseHandler();
    }
    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }
}

class CollectRewardsItem extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private desTex: Phaser.GameObjects.Text;
    private rewardsBtn: ThreeSliceButton;
    private itemIcon: DynamicImage;
    private itemCountTex: Phaser.GameObjects.Text;
    private collectTex: Phaser.GameObjects.Text;
    private dpr: number;
    private zoom: number;
    private combiData: IGalleryCombination;
    private send: Handler;
    private indexed: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.background = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_collect_popup_bg_1" });
        this.itemIcon = new DynamicImage(scene, -width * 0.5 + 36 * dpr, 0);
        this.itemCountTex = this.scene.make.text({ style: UIHelper.blackStyle(dpr) }).setOrigin(0.5);
        this.itemCountTex.x = this.itemIcon.x + 15 * dpr;
        this.itemCountTex.y = 15 * dpr;
        this.itemCountTex.setFontStyle("bold");
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.x = -this.width * 0.5 + 80 * dpr;
        this.titleTex.y = - 10 * dpr;
        this.titleTex.setFontStyle("bold");
        this.desTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(0, 0.5);
        this.desTex.x = this.titleTex.x;
        this.desTex.y = 10 * dpr;
        this.collectTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(0.5);
        this.collectTex.setFontStyle("bold");
        this.collectTex.x = width * 0.5 - 38 * dpr;
        this.collectTex.y = -10 * dpr;
        this.rewardsBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeRedSmall, UIHelper.threeRedSmall, i18n.t("common.receivereward"));
        this.rewardsBtn.setTextStyle(UIHelper.whiteStyle(this.dpr));
        this.rewardsBtn.setFontStyle("bold");
        this.rewardsBtn.x = width * 0.5 - this.rewardsBtn.width * 0.5 - 10 * dpr;
        this.rewardsBtn.y = height * 0.5 - this.rewardsBtn.height * 0.5 - 15 * dpr;
        this.rewardsBtn.on(ClickEvent.Tap, this.onRewardsHandler, this);
        this.add([this.background, this.itemIcon, this.itemCountTex, this.titleTex, this.desTex, this.collectTex, this.rewardsBtn]);
    }

    public setCombinationData(data: IGalleryCombination, indexed: number) {
        this.combiData = data;
        this.indexed = indexed;
        this.titleTex.text = data.name;
        this.desTex.text = data.des;
        const itemData: any = data.rewardItems[indexed-1];
        const url = Url.getOsdRes(itemData.texturePath);
        this.itemIcon.load(url);
        this.itemIcon.scale = this.dpr / this.zoom;
        this.itemCountTex.visible = true;
        this.itemCountTex.text = itemData.count + "";
        // if (itemData.count > 1) {
        //     this.itemCountTex.visible = true;
        //     this.itemCountTex.text = itemData.count + "";
        // } else {
        //     this.itemCountTex.visible = false;
        // }
        const difficults = this.getbgName(data.difficult);
        const color = difficults[0];
        this.background.setFrame(difficults[1]);
        const subsection = data.subsection[indexed-1];
        this.collectTex.text = `${data.gotcount}/${subsection}`;
        this.collectTex.setColor(color);
        this.desTex.setColor(color);
        if (data)
            if (data.gotindex && data.gotindex.indexOf(indexed) !== -1) {
                this.rewardsBtn.setFrameNormal(UIHelper.threeGraySmall);
                this.rewardsBtn.setText(i18n.t("common.received"));
                this.rewardsBtn.disInteractive();
            } else {
                if (data.gotcount >= subsection) {
                    this.rewardsBtn.setFrameNormal(UIHelper.threeRedSmall);
                    this.rewardsBtn.setText(i18n.t("common.receivereward"));
                    this.rewardsBtn.setInteractive();
                } else {
                    this.rewardsBtn.setFrameNormal(UIHelper.threeGraySmall);
                    this.rewardsBtn.setText(i18n.t("common.receivereward"));
                    this.rewardsBtn.disInteractive();
                }

            }

    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    private onRewardsHandler() {
        if (this.send) this.send.runWith(["combrewards", { id: this.combiData.id, indexed: this.indexed }]);
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
        return temps;
    }
}
