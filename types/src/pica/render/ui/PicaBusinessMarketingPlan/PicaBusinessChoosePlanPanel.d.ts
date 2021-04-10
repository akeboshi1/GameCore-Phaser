import { Handler } from "utils";
export declare class PicaBusinessChoosePlanPanel extends Phaser.GameObjects.Container {
    private gridtable;
    private describleText;
    private effectText;
    private materialTitle;
    private gameScroll;
    private dpr;
    private key;
    private zoom;
    private cancelHandler;
    private selectHandler;
    private curSelectData;
    private curSelectItem;
    private iteminfoTips;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string);
    setPlanData(marketPlan: any[]): void;
    setHandler(cancel: Handler, select: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onGridSelectHandler;
    private onCancelHandler;
    private onSelectHandler;
    private onMaterialItemHandler;
}
