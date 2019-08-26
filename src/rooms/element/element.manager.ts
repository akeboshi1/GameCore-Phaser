import { PacketHandler, PBpacket } from "net-socket-packet";
import { IRoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Element } from "./element";
import { Room, RoomService } from "../room";
import { LayerType } from "../layer/layer.manager";
import { DisplayInfo } from "../display/display.info";

export interface IElementManager {
  init(): void;

  readonly connection: ConnectionService | undefined;

  readonly roomManager: IRoomManager;
  readonly roomService: RoomService;

  readonly scene: Phaser.Scene | undefined;
}

export class ElementManager extends PacketHandler implements IElementManager {
  private mElements: Map<number, Element>;
  constructor(private mRoomManager: IRoomManager, private mRoom: RoomService) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);

      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.onSetPosition);
    }
  }

  init() {
    if (!this.mElements) {
      this.mElements = new Map();
    }
    this.mElements.clear();
  }

  get connection(): ConnectionService {
    if (this.mRoomManager) {
      return this.mRoomManager.connection;
    }
    console.log("roomManager is undefined");
    return;
  }

  private onAdd(packet: PBpacket) {
    if (!this.mElements) {
      this.mElements = new Map();
    }
    if (!!this.mRoomManager === false || !!this.mRoom === false) {
      console.error("room manager is undefined");
      return;
    }
    if (!!this.mRoom.layerManager === false) {
      console.error("layer manager is undefined");
      return;
    }
    const layer = this.mRoom.layerManager.getLayerByType(LayerType.SurfaceLayer);
    if (!!layer === false) {
      console.error("can't find ground layer");
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT = packet.content;
    const elements = content.elements;
    for (const ele of elements) {
      const element = new Element(this, layer);
      const loader = new DisplayInfo();
      loader.setInfo(ele);
      element.load(loader);
      this.mElements.set(ele.id || 0, element);
    }
  }

  get roomManager(): IRoomManager {
    return this.mRoomManager;
  }

  get roomService(): RoomService {
    return this.mRoom;
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }

  private onRemove(packet: PBpacket) { }

  private onMove(packet: PBpacket) { }

  private onSetPosition(packet: PBpacket) { }
}
