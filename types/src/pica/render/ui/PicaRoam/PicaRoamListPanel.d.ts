import { Handler } from "utils";
import { ICardPool, IDrawPoolStatus } from "src/pica/structure/icardpool";
export declare class PicaRoamListPanel extends Phaser.GameObjects.Container {
    private bg;
    private titlebg;
    private titleTex;
    private closeBtn;
    private mGameGrid;
    private content;
    private poolsStatus;
    private dpr;
    private zoom;
    private send;
    private tokenId;
    private cardPoolGroup;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(width?: number, height?: number): void;
    setHandler(send: Handler): void;
    init(): void;
    setRoamDataList(datas: ICardPool[]): void;
    getRoamTokenDatas(index?: number): IDrawPoolStatus[];
    private onSelectItemHandler;
    private onCloseHandler;
}
