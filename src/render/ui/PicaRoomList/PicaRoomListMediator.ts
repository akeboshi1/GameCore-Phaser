import { ILayerManager } from "../Layer.manager";
import { PicaRoomListPanel } from "./PicaRoomListPanel";
import { RoomList } from "./RoomList";
import { op_client } from "pixelpai_proto";
import { BasePanel } from "../Components/BasePanel";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";
import { Logger } from "../../../utils/log";
export class PicaRoomListMediator extends BaseMediator {
  protected mView: PicaRoomListPanel;
  private scene: Phaser.Scene;
  private roomList: RoomList;
  private world: WorldService;
  constructor(
    private layerManager: ILayerManager,
    scene: Phaser.Scene,
    worldService: WorldService
  ) {
    super();
    this.world = worldService;
    this.scene = this.layerManager.scene;
  }

  show() {
    if ((this.mView && this.mView.isShow()) || this.mShow) {
      this.layerManager.addToUILayer(this.mView);
      return;
    }
    this.roomList = new RoomList(this.world);
    this.roomList.register();
    this.roomList.on("myRoomList", this.updateMyRoomListHandler, this);
    this.roomList.on("roomList", this.updateRoomListHandler, this);
    this.roomList.on("enterRoomResult", this.onEnterRoomResuleHandler, this);
    if (!this.mView) {
      this.mView = new PicaRoomListPanel(this.scene, this.world);
    }
    this.mView.on("close", this.onCloseHandler, this);
    this.mView.on("getRoomList", this.onGetRoomListHandler, this);
    this.mView.on("getMyRoomList", this.onGetMyRoomListHandler, this);
    this.mView.on("enterRoom", this.onEnterRoomHandler, this);
    this.mView.show();
    this.layerManager.addToUILayer(this.mView);
  }

  getView(): BasePanel {
    return this.mView;
  }

  destroy() {
    if (this.roomList) {
      this.roomList.destroy();
    }
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
    super.destroy();
  }

  private onCloseHandler() {
    this.destroy();
  }

  private updateRoomListHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {
    if (!this.mView) {
      return;
    }
    this.mView.updateRoomList(content);
  }

  private updateMyRoomListHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
    if (!this.mView) {
      return;
    }
    this.mView.updateMyRoomList(content);
  }

  private onEnterRoomResuleHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM) {
    Logger.getInstance().log("enter room result:", content);
  }

  private onGetRoomListHandler() {
    if (!this.roomList) {
      return;
    }
    this.roomList.sendGetRoomList();
  }

  private onGetMyRoomListHandler() {
    if (!this.roomList) {
      return;
    }
    this.roomList.sendMyHistory();
  }

  private onEnterRoomHandler(roomID: string, passworld: string) {
    if (!this.roomList) {
      return;
    }
    this.roomList.sendEnterRoom(roomID, passworld);
    // this.onCloseHandler();
  }
}