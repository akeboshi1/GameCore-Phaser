import { BasicMediator, Game } from "gamecore";
export declare class PicaPartyListMediator extends BasicMediator {
    private mPartyListData;
    private mPlayerProgress;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    isSceneUI(): boolean;
    protected panelInit(): void;
    private onCloseHandler;
    private on_PARTY_LIST;
    private query_PARTY_LIST;
    private queryEnterRoom;
    private query_PLAYER_PROGRESS;
    private query_PLAYER_PROGRESS_REWARD;
    private on_PLAYER_PROGRESS;
    private query_GET_ROOM_LIST;
    private query_ROOM_HISTORY;
    private onRoomListHandler;
    private onMyRoomListHandler;
    private onEnterRoomResultHandler;
    private get model();
    private get config();
}
