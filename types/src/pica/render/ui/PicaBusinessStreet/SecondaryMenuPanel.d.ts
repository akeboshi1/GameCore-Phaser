import { GameScroller, GameGridTable, Button, NinePatchConfig } from "apowophaserui";
import { Handler } from "utils";
export declare class SecondaryMenuPanel extends Phaser.GameObjects.Container {
    gameScroll: GameScroller;
    gridTable: GameGridTable;
    private dpr;
    private zoom;
    private categoryHandler;
    private subCategoryHandler;
    private categoryNormalHandler;
    private categoryDownHandler;
    private subNormalHandler;
    private subDownHandler;
    private categoryBtn;
    private subCategoryBtn;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, scrollconfig: any);
    setHandler(handler: Handler, subHandler?: Handler): void;
    setButtonChangeHandler(normal?: Handler, down?: Handler, subNormal?: Handler, subDown?: Handler): void;
    setCategories<T1 extends Button>(type: (new (...args: any[]) => T1), categorys: Array<{
        text?: string;
        data: any;
    }>, btnConfig: ButtonConfig, compl?: Handler): void;
    setSubItems(datas: any[]): void;
    createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number, createFun: (cell: any, cellContainer: any) => Button, scrollMode?: number): void;
    private onSelectCategoryHandler;
    private onSubCategoryHandler;
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
