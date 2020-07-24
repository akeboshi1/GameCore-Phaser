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
import { PicBusinessStoreCreatePanel } from "./PicBusinessStoreCreatePanel";
import { PicBusinessStreetListPanel } from "./PicBusinessStreetListPanel";
export default class PicBusinessStreetPanel extends BasePanel {
    private key = "c_street_1";
    private key2 = "c_street_2";
    private content: PicBusinessContentPanel;
    private mBackGround: Phaser.GameObjects.Graphics;
    private picMyStreetPanel: PicBusinessMyStreetPanel;
    private picStoreCreatePanel: PicBusinessStoreCreatePanel;
    private picSecondStorePanel: PicBusinessStoreCreatePanel;
    private picStreetListPanel: PicBusinessStreetListPanel;
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
        this.openStoreStreetPanel();
    }

    public openMyStreet() {
        this.showMyStreetPanel();
        this.picMyStreetPanel.setMyStoreData();
    }

    public openStoreCreatePanel() {
        this.showStoreCreatePanel();
        this.picStoreCreatePanel.setStoreTypeData();
    }

    public openSecondStorePanel() {
        this.showSecondStorePanel();
        this.picSecondStorePanel.setStoreTypeData();
    }

    public openStoreStreetPanel() {
        this.showStreetListPanel();
        this.picStreetListPanel.setStreetListData();
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

    private showMyStreetPanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        const conWidth = 295 * this.dpr;
        const conHeight = height - topoffset - bottomoffset;
        const conY = topoffset + conHeight * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picMyStreetPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picMyStreetPanel = new PicBusinessMyStreetPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picMyStreetPanel.setHandler(new Handler(this, () => {

            }), new Handler(this, () => {

            }), new Handler(this, () => {
                this.hideMyStreetPanel();
                this.openStoreCreatePanel();
            }));
        }
        this.content.add(this.picMyStreetPanel);
        this.picMyStreetPanel.resetMask();
    }

    private hideMyStreetPanel() {
        this.content.remove(this.picMyStreetPanel);
    }

    private showStoreCreatePanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 295 * this.dpr;
        const conHeight = 320 * this.dpr;
        const conY = height * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picStoreCreatePanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picStoreCreatePanel = new PicBusinessStoreCreatePanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key);
            this.picStoreCreatePanel.setHandler(new Handler(this, () => {
                this.openMyStreet();
                this.hideStoreCreatePanel();
            }), new Handler(this, () => {
                this.openSecondStorePanel();
                this.hideStoreCreatePanel();
            }));
        }
        this.content.add(this.picStoreCreatePanel);
        this.picStoreCreatePanel.resetMask();
    }

    private hideStoreCreatePanel() {
        this.content.remove(this.picStoreCreatePanel);
    }

    private showSecondStorePanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const conWidth = 295 * this.dpr;
        const conHeight = 320 * this.dpr;
        const conY = height * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picSecondStorePanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picSecondStorePanel = new PicBusinessStoreCreatePanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, false);
            this.picSecondStorePanel.setHandler(new Handler(this, () => {
                this.openStoreCreatePanel();
                this.hideSecondStorePanel();
            }), new Handler(this, () => {

            }));
        }
        this.content.add(this.picSecondStorePanel);
        this.picSecondStorePanel.resetMask();
    }

    private hideSecondStorePanel() {
        this.content.remove(this.picSecondStorePanel);
    }

    private showStreetListPanel() {
        const width: number = this.scaleWidth;
        const height: number = this.scaleHeight;
        const topoffset = 90 * this.dpr;
        const bottomoffset = 74 * this.dpr;
        const conWidth = 295 * this.dpr;
        const conHeight = height - topoffset - bottomoffset;
        const conY = topoffset + conHeight * 0.5;
        const conX = width * 0.5;
        this.content.setPosition(conX, conY);
        this.content.setContentSize(conWidth, conHeight);
        if (!this.picStreetListPanel) {
            const wid = this.content.width;
            const hei = this.content.height - 50 * this.dpr;
            this.picStreetListPanel = new PicBusinessStreetListPanel(this.scene, 0, 0, wid, hei, this.dpr, this.scale, this.key, this.key2);
            this.picStreetListPanel.setHandler(new Handler(this, () => {

            }), new Handler(this, () => {

            }), new Handler(this, () => {
                this.hideStreetListPanel();
                this.openMyStreet();
            }));
        }
        this.content.add(this.picStreetListPanel);
        this.picStreetListPanel.resetMask();
    }

    private hideStreetListPanel() {
        this.content.remove(this.picStreetListPanel);
    }

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
