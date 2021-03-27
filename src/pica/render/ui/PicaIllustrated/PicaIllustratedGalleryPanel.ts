import { GameGridTable, Button, ClickEvent } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, CommonBackground, ConstraintType, GridLayoutGroup, ProgressMaskBar, ThreeSlicePath, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ItemButton } from "picaRender";
import { ICountablePackageItem, IGalleryCombination } from "picaStructure";
import { IllustratedItem } from "./PicaIllustratedItem";
export class PicaIllustratedGalleryPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private curSelectItem: IllustratedItem;
    private galleryData: any;
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

    setHandler(send: Handler) {
        this.send = send;
    }

    setGallaryData(content: any) { // op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY
        if (!content) return;
        this.galleryData = content;
        this.mGameGrid.setItems(content.list);
    }

    init() {
        const tableHeight = this.height;
        const cellWidth = 87 * this.dpr;
        const cellHeight = 92 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: this.width,
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
                    cellContainer = new IllustratedItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
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
        this.add(this.mGameGrid);
        this.resize();
    }

    private onSelectItemHandler(cell: IllustratedItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        cell.showTips();
    }
}
