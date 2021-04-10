import { Handler } from "utils";
export declare class PicaBusinessStoreCreatePanel extends Phaser.GameObjects.Container {
    private recommendedText;
    private describleText;
    private turnoverText;
    private gridtable;
    private coinImg;
    private coinBg;
    private coinCount;
    private describleText2;
    private dpr;
    private key;
    private zoom;
    private isFirst;
    private cancelHandler;
    private selectHandler;
    private curSelectData;
    private curSelectItem;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, isfirst?: boolean);
    setTypeData(datas: any): void;
    setTypeInfo(data: any): void;
    setHandler(cancel: Handler, select: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onGridSelectHandler;
    private onCancelHandler;
    private onSelectHandler;
}
