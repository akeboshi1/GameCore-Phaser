import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { op_client, op_virtual_world } from "pixelpai_proto";

export class RoomList extends PacketHandler {
  private readonly world: WorldService;
  private mEvent: Phaser.Events.EventEmitter;
  constructor($world: WorldService) {
    super();
    this.world = $world;
    this.mEvent = new Phaser.Events.EventEmitter();
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

  on(event: string | symbol, fn: Function, context?: any) {
    this.mEvent.on(event, fn, context);
  }

  off(event: string | symbol, fn: Function, context?: any) {
    this.mEvent.off(event, fn, context);
  }

  sendGetRoomList() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_LIST);
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
    this.mEvent.emit("roomList", packet.content);
  }

  private onMyRoomListHandler(packet: PBpacket) {
    this.mEvent.emit("myRoomList", packet.content);
  }

  private onEnterRoomResultHandler(packet: PBpacket) {
    this.mEvent.emit("enterRoomResult", packet);
  }

  get connection(): ConnectionService {
    if (this.world) {
      return this.world.connection;
    }
  }
}
