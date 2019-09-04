import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Element } from "./element";
import { IRoomService } from "../room";
import { FramesModel } from "../display/frames.model";
import { Console } from "../../utils/log";
import { Pos } from "../../utils/pos";

export interface IElementManager {
  readonly connection: ConnectionService | undefined;
  readonly roomService: IRoomService;
  readonly scene: Phaser.Scene | undefined;
  init(): void;
}

export class ElementManager extends PacketHandler implements IElementManager {
  private mElements: Map<number, Element>;
  constructor(private mRoom: IRoomService) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);

      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.onSetPosition);
    }
  }

  public init() {
    if (!this.mElements) {
      this.mElements = new Map();
    }
    this.mElements.clear();
  }

  public get(id: number): Element {
    if (!this.mElements) {
      return;
    }
    const element: Element = this.mElements.get(id);
    if (!element) {
      return;
    }
    return element;
  }

  public removeFromMap(id: number) {
    if (!this.mElements) return;
    if (this.mElements.has(id)) {
      this.mElements.delete(id);
    }
  }
  get connection(): ConnectionService {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    Console.log("roomManager is undefined");
    return;
  }

  private onAdd(packet: PBpacket) {
    if (!this.mElements) {
      this.mElements = new Map();
    }
    const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_OBJECT = packet.content;
    const positions = content.objectPositions;
    const type = content.nodeType;
    if (type !== op_def.NodeType.ElementNodeType) {
      return;
    }
    let element: Element;
    for (const position of positions) {
      element = new Element(position, type, this);
      this.mElements.set(element.id || 0, element);
    }
  }

  get roomService(): IRoomService {
    return this.mRoom;
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }

  private onRemove(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_OBJECT = packet.content;
    const type: number = content.nodeType;
    const ids: number[] = content.ids;
    if (type !== op_def.NodeType.CharacterNodeType) {
      return;
    }
    let element: Element;
    for (const id of ids) {
      element = this.get(id);
      if (!element) continue;
      this.removeFromMap(element.id);
      element.dispose();
    }
  }

  private onMove(packet: PBpacket) { }

  private onSetPosition(packet: PBpacket) { }
}
