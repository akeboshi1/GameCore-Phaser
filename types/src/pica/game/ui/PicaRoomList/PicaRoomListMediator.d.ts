import { BasicMediator, Game } from "gamecore";
export declare class PicaRoomListMediator extends BasicMediator {
    private picaRoomList;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    private onCloseHandler;
    private updateRoomListHandler;
    private updateMyRoomListHandler;
    private onEnterRoomResuleHandler;
    private onGetRoomListHandler;
    private onGetMyRoomListHandler;
    private onEnterRoomHandler;
}
