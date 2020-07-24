import { CheckboxGroup } from "../components/checkbox.group";
import { NinePatchTabButton } from "../../../lib/rexui/lib/ui/tab/NinePatchTabButton";
import { IPatchesConfig } from "../../../lib/rexui/lib/ui/interface/baseUI/Patches.config";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { Handler } from "../../Handler/Handler";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { ScrollerConfig } from "../../../lib/rexui/lib/ui/interface/scroller/ScrollerConfig";

export class SecondaryMenuPanel extends Phaser.GameObjects.Container {
    public gameScroll: GameScroller;
    public gridTable: GameGridTable;
    private checkGroup: CheckboxGroup;
    private dpr: number;
    private zoom: number;
    private categoryHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, scrollconfig: ScrollerConfig) {
        super(scene, x, y);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.checkGroup = new CheckboxGroup();
        this.checkGroup.on("selected", this.onSelectCategoryHandler, this);
        this.gameScroll = new GameScroller(this.scene, scrollconfig);
        this.add(this.gameScroll);
        this.gameScroll.refreshMask();
    }

    public setCategoryHandler(handler: Handler) {
        this.categoryHandler = handler;
    }
    public setCategories<T1 extends Button>(type: (new (...args: any[]) => T1), categorys: Array<{ text?: string, data: any }>, btnConfig: ButtonConfig) {
        this.gameScroll.clearItems();
        const capW = btnConfig.width;
        const capH = btnConfig.height;
        const key = btnConfig.key;
        const normalFrame = btnConfig.normalFrame;
        const downFrame = btnConfig.downFrame;
        const patchConfig = btnConfig.patchList;
        const tabs = [];
        for (const data of categorys) {
            const text = data.text;
            const btn = new type(this.scene, capW, capH, key, normalFrame, downFrame, text, patchConfig, this.dpr, this.scale);
            if (btnConfig.textStyle) btn.setTextStyle(btnConfig.textStyle);
            btn.setData("category", data.data);
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

    public createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: (cell, cellContainer) => Phaser.GameObjects.GameObject, callback: Handler, scrollMode: number = 1) {
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
            createCellContainerCallback: createFun,
        };
        this.gridTable = new GameGridTable(this.scene, tableConfig);
        this.gridTable.layout();
        this.gridTable.on("cellTap", (cell) => {
            if (cell) {
                callback.runWith(cell);
            }
        });
        this.add(this.gridTable);
        this.gridTable.resetMask();
    }
    private onSelectCategoryHandler(gameobject: Phaser.GameObjects.GameObject) {
        const category = gameobject.getData("category");
        if (this.categoryHandler) this.categoryHandler.runWith(category);
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
    text?: string;
    patchList?: IPatchesConfig[];
    data?: any;
    textStyle?: any;
}
