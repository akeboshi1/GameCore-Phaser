import { op_client } from "pixelpai_proto";
import { PlayerProperty } from "src/game/actor/data/player.property";
import { Game } from "src/game/game";
import { ModuleName } from "structure";
import { BasicMediator } from "../basic/basic.mediator";
import { PicaMainUI } from "./PicaMainUI";

export class PicaMainUIMediator extends BasicMediator {
    public static NAME: string = ModuleName.PICAMAINUI_NAME;
    private mainUI: PicaMainUI;
    private mPlayerInfo: PlayerProperty;
    private mRoomInfo: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    constructor(protected game: Game) {
        super(game);
        this.mainUI = new PicaMainUI(this.game);
        // this.mainUI.on("updateroom", this.onUpdateRoomHandler, this);
    }

    show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(PicaMainUIMediator.NAME, param);
        });
    }

    destroy() {
        if (this.mainUI) {
            this.mainUI.destroy();
        }
        this.mPlayerInfo = undefined;
        this.mRoomInfo = undefined;
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }

    get roomInfo() {
        return this.mRoomInfo;
    }

    get isSelfRoom() {
        if (!this.playerInfo || !this.roomInfo) return false;
        const rooms = this.playerInfo.rooms;
        const curRoomid = this.roomInfo.roomId;
        for (const room of rooms) {
            if (room.roomId === curRoomid) return true;
        }
        return false;
    }
}
