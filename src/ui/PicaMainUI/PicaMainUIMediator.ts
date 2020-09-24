import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { PicaMainUIPanel } from "./PicaMainUIPanel";
import { op_client } from "pixelpai_proto";
import { PicaMainUI } from "./PicaMainUI";
import { BaseMediator } from "apowophaserui";

export class PicaMainUIMediator extends BaseMediator {
    public static NAME: string = "PicaMainUIMediator";
    protected mView: PicaMainUIPanel;
    private world: WorldService;
    private mainUI: PicaMainUI;
    private mPlayerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    private mRoomInfo: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mainUI = new PicaMainUI(worldService);
        this.mainUI.on("updateplayer", this.onUpdatePlayerHandler, this);
        this.mainUI.on("updateroom", this.onUpdateRoomHandler, this);
    }

    show(param?: any) {
        if (this.mView) {
            this.update(param);
            return;
        }
        if (!this.mView) {
            this.mView = new PicaMainUIPanel(this.scene, this.world);
            this.mView.on("showPanel", this.onShowPanelHandler, this);
            this.mView.on("openroompanel", this.onOpenRoomHandler, this);
            this.mView.on("querypraise", this.onQuery_PRAISE_ROOM, this);
        }
        this.mView.show(param);
        this.layerManager.addToUILayer(this.mView);
        this.onUpdateHandler();
    }

    destroy() {
        if (this.mainUI) {
            this.mainUI.destroy();
        }
        super.destroy();
    }

    get playerInfo() {
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
    private onOpenRoomHandler() {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const uimanager = this.world.uiManager;
        uimanager.showMed("PicHouse");
    }

    private onUpdateHandler() {
        if (this.mPlayerInfo) this.mView.updatePlayerInfo(this.mPlayerInfo);
        if (this.mRoomInfo) this.mView.updateRoomInfo(this.mRoomInfo);
    }
    private onUpdatePlayerHandler(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        if (!this.mPlayerInfo) this.mPlayerInfo = content;
        else {
            for (const key in content) {
                if (content.hasOwnProperty(key)) {
                    const value = content[key];
                    if (value !== undefined) {
                        if (value instanceof Array) {
                            if (value.length > 0) this.mPlayerInfo[key] = value;
                        } else this.mPlayerInfo[key] = value;
                    }
                }
            }
        }
        if (this.mView)
            this.mView.updatePlayerInfo(content);
    }

    private onUpdateRoomHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.mRoomInfo = content;
        if (this.mView)
            this.mView.updateRoomInfo(content);
    }

    private onShowPanelHandler(panel: string, data?: any) {
        if (!this.mainUI || !this.world) {
            return;
        }
        const uiManager = this.world.uiManager;
        uiManager.showMed(panel);
        if (panel === "CharacterInfo") {
            this.mainUI.fetchPlayerInfo();
        }
        // const uiManager = this.world.uiManager;
        // if (data)
        //     uiManager.showMed(panel, data);
        // else uiManager.showMed(panel);
    }

    private onQuery_PRAISE_ROOM(praise: boolean) {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const roomid = this.mRoomInfo.roomId;
        this.mainUI.query_PRAISE_ROOM(roomid, praise);
    }

}
