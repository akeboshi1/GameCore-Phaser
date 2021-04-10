import { Handler } from "utils";
export declare class MoreButtonPanel extends Phaser.GameObjects.Container {
    private blackGraphic;
    private topbg;
    private place;
    private sell;
    private dpr;
    private send;
    private itemdata;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: any);
    setItemData(data: any, category: number): void;
    /**
     *
     * @param type 1 || 5 - 家具 3 - 道具
     */
    setLayoutType(type: number): void;
    setHandler(send: Handler): void;
    show(): void;
    hide(): void;
    protected addListen(): void;
    protected removeListen(): void;
    protected init(): void;
    private onPlaceHandler;
    private onSellHandler;
}
