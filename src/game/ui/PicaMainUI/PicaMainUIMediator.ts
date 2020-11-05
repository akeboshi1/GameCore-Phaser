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
            this.game.emitter.on("showPanel", this.onShowPanelHandler, this);
            this.game.emitter.on("openroompanel", this.onOpenRoomHandler, this);
            this.game.emitter.on("querypraise", this.onQuery_PRAISE_ROOM, this);
            this.mainUI.register();
        });
    }

    hide() {
        super.hide();
        this.game.emitter.off("showPanel", this.onShowPanelHandler, this);
        this.game.emitter.off("openroompanel", this.onOpenRoomHandler, this);
        this.game.emitter.off("querypraise", this.onQuery_PRAISE_ROOM, this);
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

    private onShowPanelHandler(panel: string, data?: any) {
        if (!this.mainUI || !this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.showMed(panel);
        if (panel === ModuleName.CHARACTERINFO_NAME) {
            this.mainUI.fetchPlayerInfo();
        }
        // const uiManager = this.world.uiManager;
        // if (data)
        //     uiManager.showMed(panel, data);
        // else uiManager.showMed(panel);
    }

    private onOpenRoomHandler() {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const uimanager = this.game.uiManager;
        uimanager.showMed("PicHouse");
    }

    private onQuery_PRAISE_ROOM(praise: boolean) {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const roomid = this.mRoomInfo.roomId;
        this.mainUI.query_PRAISE_ROOM(roomid, praise);
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
