import { NineSlicePatch, ClickEvent, Button, GameGridTable } from "apowophaserui";
import { Coin, Font, Handler, i18n, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { IExtendCountablePackageItem, IGalleryCombination } from "picaStructure";
import { Render } from "gamecoreRender";
import { UITools } from "picaRender";
import { PicaIllustratedItemButton } from "./PicaNewIllustratedItem";
export class PicaNewCombinationPanel extends Phaser.GameObjects.Container {
    private backgrand: Phaser.GameObjects.Graphics;
    private titleName: Phaser.GameObjects.Text;
    private bottomBg: Phaser.GameObjects.Graphics;
    private combineNameBg: Phaser.GameObjects.Image;
    private combinName: Phaser.GameObjects.Text;
    private closeButton: Button;
    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private render: Render;
    private send: Handler;
    constructor(scene: Phaser.Scene, render: Render, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.render = render;
        this.setInteractive();
        this.init();
    }

    resize(w: number, h: number) {
        w = w || this.width;
        h = h || this.height;
        this.setSize(w, h);
    }
    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    init() {
        const backWidth = 1.5 * this.width, backheight = 3 * this.height;
        this.backgrand = this.scene.make.graphics(undefined, false);
        this.backgrand.fillStyle(0x000000, 0.77);
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
        this.bottomBg = this.scene.make.graphics(undefined, false);
        this.bottomBg.clear();
        this.bottomBg.fillStyle(0x52D1FF, 1);
        const bottomWidth = 298 * this.dpr, bottomHeight = 390 * this.dpr;
        this.bottomBg.fillRoundedRect(-bottomWidth * 0.5, -bottomHeight * 0.5, bottomWidth, bottomHeight);
        this.bottomBg.y = -this.height * 0.5 + bottomHeight * 0.5 + 45 * this.dpr;
        this.combineNameBg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_favorites_popup_title" });
        this.combineNameBg.y = -this.height * 0.5 + 75 * this.dpr;
        this.combinName = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 14) }).setOrigin(0.5);
        this.combinName.y = this.combineNameBg.y;
        this.createGridTable();
        this.add([this.backgrand, bg, titlebg, this.titleName, this.closeButton, this.bottomBg, this.combineNameBg, this.combinName, this.mGameGrid]);
        this.resize(0, 0);
    }
    setGallaryData(data: IGalleryCombination) {
        this.combinName.text = data.name;
        this.mGameGrid.setItems(data.requirement);
        this.mGameGrid.setT(0);
    }
    public setHandler(send: Handler) {
        this.send = send;
    }

    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }

    private createGridTable() {
        const tableHeight = 330 * this.dpr;
        const tableWidth = 285 * this.dpr;
        const cellWidth = 73 * this.dpr;
        const cellHeight = 92 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: tableWidth,
                height: tableHeight,
                columns: 4,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                cellPadX: -5 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = this.mGameGrid.items.length - cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicaIllustratedItemButton(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                }
                cellContainer.setItemData(item);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.mGameGrid.y = this.height * 0.5 - tableHeight * 0.5 - 20 * this.dpr;
    }
    private onSelectItemHandler(cell: PicaIllustratedItemButton) {
        if (this.send) this.send.runWith(["furidetail", cell.itemData]);
    }
}
