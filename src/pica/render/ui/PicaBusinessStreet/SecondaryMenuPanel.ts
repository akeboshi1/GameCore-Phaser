import { GameScroller, GameGridTable, Button, NinePatchConfig } from "apowophaserui";
import { Handler } from "utils";

export class SecondaryMenuPanel extends Phaser.GameObjects.Container {
    public gameScroll: GameScroller;
    public gridTable: GameGridTable;
    private dpr: number;
    private zoom: number;
    private categoryHandler: Handler;
    private subCategoryHandler: Handler;
    private categoryNormalHandler: Handler;
    private categoryDownHandler: Handler;
    private subNormalHandler: Handler;
    private subDownHandler: Handler;
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

    public setHandler(handler: Handler, subHandler?: Handler) {
        this.categoryHandler = handler;
        this.subCategoryHandler = subHandler;
    }

    public setButtonChangeHandler(normal?: Handler, down?: Handler, subNormal?: Handler, subDown?: Handler) {
        this.categoryNormalHandler = normal;
        this.categoryDownHandler = down;
        this.subNormalHandler = subNormal;
        this.subDownHandler = subDown;
    }

    public setCategories<T1 extends Button>(type: (new (...args: any[]) => T1), categorys: Array<{ text?: string, data: any }>, btnConfig: ButtonConfig, compl?: Handler) {
        this.categoryBtn = undefined;
        (<any>this.gameScroll).clearItems();
        const capW = btnConfig.width;
        const capH = btnConfig.height;
        const key = btnConfig.key;
        const normalFrame = btnConfig.normalFrame;
        const downFrame = btnConfig.downFrame;
        const patchConfig = btnConfig.patchConfig;
        const music = btnConfig.music;
        const bold = btnConfig.bold;
        const tabs = [];
        for (const data of categorys) {
            const text = data.text;
            const btn = new type(this.scene, key, normalFrame, downFrame, text, music, this.dpr, this.zoom, patchConfig);
            if (btnConfig.textStyle) btn.setTextStyle(btnConfig.textStyle);
            btn.setData("category", data.data);
            btn.disableInteractive();
            if (bold) btn.setFontStyle("bold");
            if (capW) btn.width = capW;
            if (capH) btn.height = capH;
            this.gameScroll.addItem(btn);
            tabs.push(btn);
        }
        this.gameScroll.Sort(true);
        this.gameScroll.refreshMask();
        if (compl) compl.runWith([tabs]);
        this.onSelectCategoryHandler(tabs[0]);
    }
    public setSubItems(datas: any[]) {
        if (this.gridTable) {
            this.subCategoryBtn = undefined;
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
            if (this.categoryNormalHandler) this.categoryNormalHandler.runWith(this.categoryBtn);
            else this.categoryBtn.changeNormal();
        }
        if (this.categoryDownHandler) this.categoryDownHandler.runWith(obj);
        else obj.changeDown();
        this.categoryBtn = obj;
        const category = obj.getData("category");
        if (this.categoryHandler) this.categoryHandler.runWith(category);
    }
    private onSubCategoryHandler(obj) {
        if (this.subCategoryBtn) {
            if (this.subNormalHandler) this.subNormalHandler.runWith(this.subCategoryBtn);
            else this.subCategoryBtn.changeNormal();
        }
        if (this.subDownHandler) this.subDownHandler.runWith(obj);
        else obj.changeDown();
        this.subCategoryBtn = obj;
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
    bold?: boolean;
}
