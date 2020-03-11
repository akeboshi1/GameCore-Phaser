import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaRoomListPanel } from "./PicaRoomListPanel";
import { RoomList } from "./RoomList";
import { op_client } from "pixelpai_proto";

export class PicaRoomListMediator extends BaseMediator {
    protected mView: PicaRoomListPanel;
    private scene: Phaser.Scene;
    private roomList: RoomList;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super(worldService);
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.isShowing) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        this.roomList = new RoomList(this.world);
        this.roomList.on("roomList", this.updateRoomListHandler, this);
        if (!this.mView) {
            this.mView = new PicaRoomListPanel(this.scene, this.world);
        }
        this.mView.on("close", this.onCloseHandler, this);
        this.mView.on("getRoomList", this.onGetRoomListHandler, this);
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    private onCloseHandler() {
      if (this.mView) {
        this.mView.destroy();
        this.mView = undefined;
      }
    }

    private updateRoomListHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
      this.mView.updateRoomList(content);
    }

    private onGetRoomListHandler() {
      if (!this.roomList) {
        return;
      }
      this.roomList.sendGetRoomList();
    }
}
