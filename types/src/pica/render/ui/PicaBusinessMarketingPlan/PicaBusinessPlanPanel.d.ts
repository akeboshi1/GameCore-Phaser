import { Render } from "gamecoreRender";
import { Handler } from "utils";
export declare class PicaBusinessPlanPanel extends Phaser.GameObjects.Container {
    private planBuffText;
    private describleText;
    private gridtable;
    private dpr;
    private key;
    private zoom;
    private cancelHandler;
    private addPlanHandler;
    private render;
    private topbg;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string);
    setRender(world: Render): void;
    setPlanData(content: any): void;
    setHandler(cancel: Handler, add: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onGridSelectHandler;
    private onAddPlanHandler;
    private onCancelHandler;
}
