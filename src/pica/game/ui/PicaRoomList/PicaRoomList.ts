import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";

export class PicaRoomList extends BasicModel {
  constructor(game: Game) {
    super(game);
    this.register();
  }
  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST, this.onRoomListHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY, this.onMyRoomListHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM, this.onEnterRoomResultHandler);
    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  destroy() {
    super.destroy();
    this.unregister();
    this.event.destroy();
  }

  sendGetRoomList() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_LIST);
    const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_LIST = packet.content;
    content.page = 1;
    content.perPage = 30;
    this.connection.send(packet);
  }

  sendMyHistory() {
    this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY));
  }

  sendEnterRoom(roomID: string, password?: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM = packet.content;
    content.roomId = roomID;
    content.password = password;
    this.connection.send(packet);
  }

  private onRoomListHandler(packet: PBpacket) {
    this.event.emit("roomList", packet.content);
  }

  private onMyRoomListHandler(packet: PBpacket) {
    this.event.emit("myRoomList", packet.content);
  }

  private onEnterRoomResultHandler(packet: PBpacket) {
    this.event.emit("enterRoomResult", packet);
  }

  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }
}
