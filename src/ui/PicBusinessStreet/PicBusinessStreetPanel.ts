import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BBCodeText, Button, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { i18n } from "../../i18n";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { Url } from "../../utils/resUtil";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { UIAtlasName, UIAtlasKey } from "../ui.atals.name";
import { Handler } from "../../Handler/Handler";
import { CheckBox } from "../../../lib/rexui/lib/ui/checkbox/CheckBox";
import { PicBusinessContentPanel } from "./PicBusinessContentPanel";
import { PicBusinessMyStreetPanel } from "./PicBusinessMyStreetPanel";
export default class PicBusinessStreetPanel extends BasePanel {
    private key = "c_street_1";
    private key2 = "c_street_2";
    private content: PicBusinessContentPanel;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picMyStreetPanel: PicBusinessMyStreetPanel;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
    }

    public show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.setInteractive();
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "c_street_1/c_street_1.png", "c_street_1/c_street_1.json");
        this.addAtlas(this.key2, "c_street_2/c_street_2.png", "c_street_2/c_street_2.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }
    init() {
        const zoom = this.scale;
        const wid: number = this.scaleWidth;
        const hei: number = this.scaleHeight;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x6AE2FF, 0);
        this.mBackGround.fillRect(0, 0, wid * zoom, hei * zoom);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.add(this.mBackGround);
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        const conWidth = 295 * this.dpr;
        const conHeight = hei - topoffset - bottomoffset;
        const conY = topoffset + conHeight * 0.5;
        const conX = wid * 0.5;
        this.content = new PicBusinessContentPanel(this.scene, conX, conY, conWidth, conHeight, this.dpr, this.key, this.key2);
        this.content.setCloseHandler(new Handler(this, this.OnCloseHandler));
        this.add(this.content);
        this.resize(wid, hei);
        super.init();
        this.openMyStreet();
    }

    public openMyStreet() {
        if (!this.picMyStreetPanel) {
            const width = this.content.width;
            const height = this.content.height - 50 * this.dpr;
            this.picMyStreetPanel = new PicBusinessMyStreetPanel(this.scene, 0, 0, width, height, this.dpr, this.scale, this.key);
            this.content.add(this.picMyStreetPanel);
            this.picMyStreetPanel.resetMask();

        }
        this.picMyStreetPanel.setMyStoreData();
    }

    public destroy() {

        super.destroy();
    }

    // private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: Function, callback: Handler) {
    //     const tableConfig: GridTableConfig = {
    //         x,
    //         y,
    //         table: {
    //             width,
    //             height,
    //             columns: 3,
    //             cellWidth: capW,
    //             cellHeight: capH,
    //             reuseCellContainer: true,
    //             cellPadX: 24 * this.dpr
    //         },
    //         scrollMode: 1,
    //         clamplChildOY: false,
    //         // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
    //         createCellContainerCallback: (cell, cellContainer) => {
    //             const scene = cell.scene,
    //                 item = cell.item;
    //             if (cellContainer === null) {
    //                 cellContainer = createFun();
    //                 this.content.add(cellContainer);
    //             }
    //             cellContainer.setData({ item });
    //             cellContainer.setItemData(item);
    //             return cellContainer;
    //         },
    //     };
    //     const grid = new GameGridTable(this.scene, tableConfig);
    //     grid.layout();
    //     grid.on("cellTap", (cell) => {
    //         if (cell) {
    //             callback.runWith(cell);
    //         }
    //     });
    //     this.content.add(grid.table);
    //     return grid;
    // }

    private OnCloseHandler() {
        this.emit("hide");
    }

    private onSelectItemHandler(item) {

    }

    private getRichLabel(text: string, color = "#2B4BB5") {
        const label = `[stroke=${color}][color=${color}]${text}:[/color][/stroke]`;
        return label;
    }
    private getspaceStr(num: number) {
        let str = "";
        for (let i = 0; i < num; i++) {
            str += " ";
        }
        return str;
    }

}
