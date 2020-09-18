import { Handler } from "../../Handler/Handler";
import { GameScroller, GameGridTable, Button, NinePatchConfig } from "apowophaserui";

export class SecondaryMenuPanel extends Phaser.GameObjects.Container {
    public gameScroll: GameScroller;
    public gridTable: GameGridTable;
    private dpr: number;
    private zoom: number;
    private categoryHandler: Handler;
    private subCategoryHandler: Handler;
    private categoryBtn: Button;
    private subCategoryBtn: Button;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, scrollconfig: any) {
        super(scene, x, y);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        scrollconfig.cellupCallBack = this.onSelectCategoryHandler.bind(this);
        this.gameScroll = new GameScroller(this.scene, scrollconfig);
        this.add(this.gameScroll);
    }

    public setHandler(handler: Handler, subHandler: Handler) {
        this.categoryHandler = handler;
        this.subCategoryHandler = subHandler;
    }
    public setCategories<T1 extends Button>(type: (new (...args: any[]) => T1), categorys: Array<{ text?: string, data: any }>, btnConfig: ButtonConfig) {
        (<any>this.gameScroll).clearItems();
        const capW = btnConfig.width;
        const capH = btnConfig.height;
        const key = btnConfig.key;
        const normalFrame = btnConfig.normalFrame;
        const downFrame = btnConfig.downFrame;
        const patchConfig = btnConfig.patchConfig;
        const music = btnConfig.music;
        const tabs = [];
        for (const data of categorys) {
            const text = data.text;
            const btn = new type(this.scene, key, normalFrame, downFrame, text, music, this.dpr, this.zoom, patchConfig);
            if (btnConfig.textStyle) btn.setTextStyle(btnConfig.textStyle);
            btn.setData("category", data.data);
            btn.disableInteractive();
            if (capW) btn.width = capW;
            if (capH) btn.height = capH;
            this.gameScroll.addItem(btn);
            tabs.push(btn);
        }
        this.gameScroll.setAlign(1);
        this.gameScroll.Sort(true);
        this.gameScroll.refreshMask();
        const items = this.gameScroll.getItemList();
        for (const item of items) {
            (<Button>item).background.visible = false;
        }
        this.onSelectCategoryHandler(items[0]);
    }
    public setSubItems(datas: any[]) {
        if (this.gridTable) {
            this.gridTable.setItems(datas);
            this.gridTable.resetMask();
            const cells = this.gridTable.getCells();
            if (cells) {
                const cell = cells[0];
                if (cell && cell.container) {
                    this.onSubCategoryHandler(cell.container);
                }
            }
        }
    }

    public createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: (cell, cellContainer) => Button, scrollMode: number = 1) {
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
                zoom: this.zoom
            },
            scrollMode,
            clamplChildOY: false,
            createCellContainerCallback: createFun,
        };
        this.gridTable = new GameGridTable(this.scene, tableConfig);
        this.gridTable.layout();
        this.gridTable.on("cellTap", (cell) => {
            if (cell) {
                this.onSubCategoryHandler(cell);
            }
        });
        this.add(this.gridTable);
        this.gridTable.resetMask();
    }
    private onSelectCategoryHandler(obj) {
        if (this.categoryBtn) {
            this.categoryBtn.background.visible = false;
            // this.categoryBtn.changeNormal();
        }
        obj.background.visible = true;
        obj.changeDown();
        this.categoryBtn = obj;
        const category = obj.getData("category");
        if (this.categoryHandler) this.categoryHandler.runWith(category);
    }
    private onSubCategoryHandler(obj) {
        if (this.subCategoryBtn) this.subCategoryBtn.changeNormal();
        obj.changeDown();
        if (this.subCategoryHandler) this.subCategoryHandler.runWith(obj);
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
    patchConfig?: NinePatchConfig;
    data?: any;
    textStyle?: any;
    music?: any;
}
