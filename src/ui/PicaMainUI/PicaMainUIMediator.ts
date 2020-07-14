import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { PicaMainUIPanel } from "./PicaMainUIPanel";
import { op_client } from "pixelpai_proto";
import { PicaMainUI } from "./PicaMainUI";
import { BaseMediator } from "tooqingui";

export class PicaMainUIMediator extends BaseMediator {
    public static NAME: string = "PicaMainUIMediator";
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
        }
        this.mView.show(param);
        this.mView.on("openroompanel", this.onOpenRoomHandler, this);
        this.layerManager.addToUILayer(this.mView);
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
        if (!this.roomInfo || this.roomInfo.roomType !== "pkt_ST0000000") return;
        const uimanager = this.world.uiManager;
        uimanager.showMed("PicHouse");
    }
    private onUpdateHandler(data: any) {
        this.show(data);
    }

    private onUpdatePlayerHandler(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        this.onUpdateHandler(content);
        this.mPlayerInfo = content;
    }

    private onUpdateRoomHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.onUpdateHandler(content);
        this.mRoomInfo = content;
    }

    private onShowPanelHandler(panel: string, data?: any) {
        if (!panel || !this.world) {
            return;
        }
        const uiManager = this.world.uiManager;
        if (data)
            uiManager.showMed(panel, data);
        else uiManager.showMed(panel);
    }

}
