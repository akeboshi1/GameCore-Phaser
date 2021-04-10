import { Handler } from "utils";
export declare class PicaSceneNavigationMapPanel extends Phaser.GameObjects.Container {
    private dpr;
    private zoom;
    private sendHandler;
    private mGameScroll;
    private curTownItem;
    private townItems;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    create(): void;
    show(): void;
    hide(): void;
    refreshMask(): void;
    setHandler(handler: Handler): void;
    setTownDatas(datas: any[]): void;
    private onPointerUpHandler;
    private onTownItemHandler;
    private onExtendsHandler;
}
