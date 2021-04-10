import { Handler } from "utils";
import { IGalleryCombination } from "picaStructure";
export declare class PicaIllustredCollectPanel extends Phaser.GameObjects.Container {
    private mGameGrid;
    private dpr;
    private zoom;
    private send;
    private curSelectItem;
    private combinations;
    private doneMissions;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(width?: number, height?: number): void;
    setHandler(send: Handler): void;
    setCombinationData(content: IGalleryCombination[]): any[];
    setDoneMissionList(list: number[]): void;
    init(): void;
    private onSelectItemHandler;
    private getCellsHeights;
}
