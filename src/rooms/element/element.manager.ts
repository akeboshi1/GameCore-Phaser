import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Element } from "./element";
import { IRoomService } from "../room";
import { Logger } from "../../utils/log";
import { GameConfigService } from "../../config/gameconfig.service";
import { Pos } from "../../utils/pos";

export interface IElementManager {
  readonly connection: ConnectionService | undefined;
  readonly roomService: IRoomService;
  readonly scene: Phaser.Scene | undefined;
  readonly camera: Phaser.Cameras.Scene2D.Camera | undefined;

  init(): void;
}

export class ElementManager extends PacketHandler implements IElementManager {

  private mElements: Map<number, Element> = new Map();
  private mGameConfig: GameConfigService;

  constructor(private mRoom: IRoomService) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);

      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.onSetPosition);
    }
    if (this.mRoom && this.mRoom.world) {
      this.mGameConfig = this.mRoom.world.gameConfigService;
    }
  }

  public init() {
    this.mElements.clear();
  }

  public get(id: number): Element {
    const element: Element = this.mElements.get(id);
    if (!element) {
      return;
    }
    return element;
  }

  public removeFromMap(id: number) {
    const element = this.mElements.get(id);
    if (element) {
      this.mElements.delete(id);
      element.destory();
      if (this.roomService) {
        this.roomService.blocks.remove(element);
      }
    }
  }

  get camera(): Phaser.Cameras.Scene2D.Camera | undefined {
    return this.mRoom.cameraService.camera;
  }

  get connection(): ConnectionService {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    Logger.log("roomManager is undefined");
    return;
  }

  private onAdjust(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION = packet.content;
    const sprites = content.spritePositions;
    const type = content.nodeType;
    if (type !== op_def.NodeType.ElementNodeType) {
      return;
    }
    let ele: Element;
    let point: op_def.IPBPoint3f;
    for (const sprite of sprites) {
      ele = this.mElements.get(sprite.id);
      if (!ele) {
        continue;
      }
      point = sprite.point3f;
      ele.setPosition(new Pos(point.x | 0, point.y | 0, point.z | 0));
    }
  }

  private onAdd(packet: PBpacket) {
    if (!this.mRoom.layerManager) {
      Logger.error("layer manager does not exist");
      return;
    }
    if (!this.mGameConfig) {
      Logger.error("gameConfig does not exist");
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
    const objs: op_client.ISprite[] | undefined = content.spritePositions;
    if (!objs) return;
    const type = content.nodeType;
    if (type !== op_def.NodeType.ElementNodeType) {
      return;
    }
    let point: op_def.IPBPoint3f;
    for (const obj of objs) {
      point = obj.point3f;
      if (point) {
        this._add(obj.id, new Pos(point.x, point.y, point.z));
      }
    }
  }

  private _add(id: number, pos: Pos) {
    if (!this.mElements.get(id)) {
      const ele = new Element(id, pos, this);
      this.mElements.set(ele.id || 0, ele);
      this.roomService.blocks.add(ele);
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
    const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
    const type: number = content.nodeType;
    const ids: number[] = content.ids;
    if (type !== op_def.NodeType.ElementNodeType) {
      return;
    }
    for (const id of ids) {
      this.removeFromMap(id);
    }
  }

  private onMove(packet: PBpacket) {
  }

  private onSetPosition(packet: PBpacket) {
  }
}
