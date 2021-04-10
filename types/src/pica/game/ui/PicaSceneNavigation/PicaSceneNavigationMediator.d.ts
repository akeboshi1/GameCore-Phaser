import { BasicMediator, Game } from "gamecore";
export declare class PicaSceneNavigationMediator extends BasicMediator {
    private mPlayerProgress;
    private mPartyListData;
    private tempData;
    private chooseType;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    isSceneUI(): boolean;
    protected panelInit(): void;
    private onCloseHandler;
    private queryEnterRoom;
    private onEnterRoomResultHandler;
    private setNavigationData;
    private get model();
    private get config();
}
