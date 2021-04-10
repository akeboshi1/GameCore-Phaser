import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { op_client } from "pixelpai_proto";
import { PicaNewMain } from "./PicaNewMain";
export declare class PicaNewMainMediator extends BasicMediator {
    protected game: Game;
    protected mModel: PicaNewMain;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    isSceneUI(): boolean;
    protected panelInit(): void;
    private onUpdateRoomHandler;
    private onUpdatePlayerHandler;
    private onOpenHouseHandler;
    private onQuery_PRAISE_ROOM;
    private onShowPanelHandler;
    private onFoldButtonHandler;
    private queryDecorate;
    get playerInfo(): PlayerProperty;
    get roomInfo(): op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    get isSelfRoom(): boolean;
}
