import { BasicMediator, Game } from "gamecore";
import { op_client } from "pixelpai_proto";
export declare class PicaMainUIMediator extends BasicMediator {
    protected game: Game;
    private mPlayerInfo;
    private mRoomInfo;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    isSceneUI(): boolean;
    protected panelInit(): void;
    private onShowPanelHandler;
    private onUpdateRoomHandler;
    private onOpenRoomHandler;
    private onQuery_PRAISE_ROOM;
    private fetchDetail;
    private onUpdateDetailHandler;
    get playerInfo(): op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    get roomInfo(): op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    get isSelfRoom(): boolean;
}
