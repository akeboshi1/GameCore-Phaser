import { op_client } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { PicaRoomList } from "./PicaRoomList";
import { ModuleName } from "structure";
import { Logger } from "utils";
export class PicaRoomListMediator extends BasicMediator {
  private picaRoomList: PicaRoomList;
  constructor(game: Game) {
    super(ModuleName.PICAROOMLIST_NAME, game);
    this.picaRoomList = new PicaRoomList(game);
  }

  show(param?: any) {
    super.show(param);
    this.game.emitter.on(ModuleName.PICAROOMLIST_NAME + "_close", this.onCloseHandler, this);
    this.game.emitter.on(ModuleName.PICAROOMLIST_NAME + "_getRoomList", this.onGetRoomListHandler, this);
    this.game.emitter.on(ModuleName.PICAROOMLIST_NAME + "_getMyRoomList", this.onGetMyRoomListHandler, this);
    this.game.emitter.on(ModuleName.PICAROOMLIST_NAME + "_enterRoom", this.onEnterRoomHandler, this);

    this.game.emitter.on("myRoomList", this.updateMyRoomListHandler, this);
    this.game.emitter.on("picaRoomList", this.updateRoomListHandler, this);
    this.game.emitter.on("enterRoomResult", this.onEnterRoomResuleHandler, this);
  }

  hide() {
    super.hide();
    this.game.emitter.off(ModuleName.PICAROOMLIST_NAME + "_close", this.onCloseHandler, this);
    this.game.emitter.off(ModuleName.PICAROOMLIST_NAME + "_getRoomList", this.onGetRoomListHandler, this);
    this.game.emitter.off(ModuleName.PICAROOMLIST_NAME + "_getMyRoomList", this.onGetMyRoomListHandler, this);
    this.game.emitter.off(ModuleName.PICAROOMLIST_NAME + "_enterRoom", this.onEnterRoomHandler, this);

    this.game.emitter.off("myRoomList", this.updateMyRoomListHandler, this);
    this.game.emitter.off("picaRoomList", this.updateRoomListHandler, this);
    this.game.emitter.off("enterRoomResult", this.onEnterRoomResuleHandler, this);
  }

  destroy() {
    if (this.picaRoomList) {
      this.picaRoomList.destroy();
    }
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
    super.destroy();
  }

  private onCloseHandler() {
    this.hide();
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
    Logger.getInstance().debug("enter room result:", content);
  }

  private onGetRoomListHandler() {
    if (!this.picaRoomList) {
      return;
    }
    this.picaRoomList.sendGetRoomList();
  }

  private onGetMyRoomListHandler() {
    if (!this.picaRoomList) {
      return;
    }
    this.picaRoomList.sendMyHistory();
  }

  private onEnterRoomHandler(roomID: string, passworld: string) {
    if (!this.picaRoomList) {
      return;
    }
    this.picaRoomList.sendEnterRoom(roomID, passworld);
  }
}
