import { CheckboxGroup } from "../components/checkbox.group"
import { NinePatchTabButton } from "../../../lib/rexui/lib/ui/tab/NinePatchTabButton";
import { IPatchesConfig } from "../../../lib/rexui/lib/ui/interface/baseUI/Patches.config";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { Handler } from "../../Handler/Handler";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { ScrollerConfig } from "../../../lib/rexui/lib/ui/interface/scroller/ScrollerConfig";

export class SecondaryMenuPanel extends Phaser.GameObjects.Container {
    private checkGroup: CheckboxGroup;
    private dpr: number;
    private gameScroll: GameScroller;
    private gridTable: GameGridTable;
    private zoom: number;
    private categoryHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, scrollconfig: ScrollerConfig) {
        super(scene, x, y)
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.checkGroup = new CheckboxGroup();
        this.checkGroup.on("selected", this.onSelectCategoryHandler, this);
        this.gameScroll = new GameScroller(this.scene, scrollconfig);
        this.gameScroll.refreshMask();
        this.add(this.gameScroll);
    }

    public setCategoryHandler(handler: Handler) {
        this.categoryHandler = handler;
    }
    public createCategories<T1 extends Button>(type: (new (...args: any[]) => T1), categorys: { text?: string, data: any }[], btnConfig: ButtonConfig) {
        const capW = btnConfig.width;
        const capH = btnConfig.height;
        const key = btnConfig.key;
        const normalFrame = btnConfig.normalFrame;
        const downFrame = btnConfig.downFrame;
        const patchConfig = btnConfig.patchList;
        const tabs = [];
        for (let i = 0; i < categorys.length; i++) {
            const text = categorys[i].text;
            const btn = new type(this.scene, capW, capH, key, normalFrame, downFrame, text, patchConfig, this.dpr, this.scale);
            if (btnConfig.textStyle) btn.setTextStyle(btnConfig.textStyle);
            btn.setData("category", categorys[i].data);
            this.gameScroll.addItem(btn);
            tabs.push(btn);
        }
        this.checkGroup.appendItemAll(tabs);
        this.checkGroup.selectIndex(0);
        this.gameScroll.Sort(true);
    }

    public setSubItems(datas: any[]) {
        if (this.gridTable) this.gridTable.setItems(datas);
    }

    private onSelectCategoryHandler(gameobject: Phaser.GameObjects.GameObject) {
        const category = gameobject.getData("category");
        if (this.categoryHandler) this.categoryHandler.runWith(category);
    }
    public createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: Handler, callback: Handler, scrollMode: number = 1) {
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
                zoom: this.zoom
            },
            scrollMode,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const item = cell.item;
                createFun.runWith([item, cellContainer]);
                return cellContainer;
            },
        };
        this.gridTable = new GameGridTable(this.scene, tableConfig);
        this.gridTable.layout();
        this.gridTable.on("cellTap", (cell) => {
            if (cell) {
                callback.runWith(cell);
            }
        });
        this.add(this.gridTable.table);
        this.gridTable.resetMask();
    }
}

export interface ButtonConfig {
    x?: number;
    y?: number;
    width: number;
    height: number;
    key: string;
    normalFrame: string;
    downFrame: string;
    text: string;
    patchList?: IPatchesConfig[];
    data?: any;
    textStyle?: any;
}