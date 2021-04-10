import { BasicMediator, Game } from "gamecore";
export declare class PicaHouseMediator extends BasicMediator {
    private picaHouse;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    protected panelInit(): void;
    private onRoomInfoHandler;
    private queryRoomInfoHandler;
    private query_REFURBISH_REQUIREMENTS;
    private query_ROOM_REFURBISH;
    private on_REFURBISH_REQUIREMENTS;
}
