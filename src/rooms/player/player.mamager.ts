import { ElementManager, IElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { IRoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { Room, RoomService } from "../room";
import { LayerType } from "../layer/layer.manager";
import { PlayerInfo } from "./playInfo";
import { DragonBonesDisplay } from "../display/dragonBones.display";
import { DisplayInfo } from "../display/display.info";
export class PlayerManager extends PacketHandler implements IElementManager {
  private mPlayerMap: Map<number, Player>;
  private mMainRoleInfo: PlayerInfo;
  constructor(private mRoomMgr: IRoomManager, private mRoom: Room) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.mMainRoleInfo = new PlayerInfo();
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
      //todo playState change
      this.addHandlerFun(1, this.onChangeState);
    }
  }

  init() {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    this.mPlayerMap.clear();
  }

  get connection(): ConnectionService {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    console.error("room is undefined");
  }

  public setMainRoleInfo(obj: op_client.IActor) {
    this.mMainRoleInfo.setInfo(obj);
    if (obj.walkOriginPoint) {
      this.mMainRoleInfo.setOriginWalkPoint(obj.walkOriginPoint);
    }
    if (obj.originPoint) {
      this.mMainRoleInfo.setOriginCollisionPoint(obj.originPoint);
    }
    const layer = this.mRoom.layerManager.getLayerByType(LayerType.SurfaceLayer);
    if (!!layer === false) {
      console.error("can't find ground layer");
      return;
    }
    let player: Player = new Player(this, layer);
    (player.getDisplay() as DragonBonesDisplay).dragonBonesName = "bones_human01"//obj.avatar.id;
    // if (this.initialize === false) {
    //   this._initialize = true;
    //   Globals.MessageCenter.emit(MessageType.PLAYER_DATA_INITIALIZE);
    // }
  }

  private onAdd(packet: PBpacket) {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    const layer = this.mRoom.layerManager.getLayerByType(LayerType.SurfaceLayer);
    if (!!layer === false) {
      console.error("can't find surface layer");
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER = packet.content;
    const players = content.actors;
    if (players) {
      let displayInfo: DisplayInfo;
      for (const player of players) {
        const plyer = new Player(this, layer);
        displayInfo = new DisplayInfo();
        displayInfo.setInfo(player);
        plyer.load(displayInfo);
        this.mPlayerMap.set(player.id || 0, plyer);
      }
    }
  }

  private onRemove(packet: PBpacket) {

  }

  private onMove(packet: PBpacket) {
    //todo player move
  }

  private onChangeState(packet: PBpacket) {
    let content = packet.content;
    let id: number = content.id;
    let state: string = content.state;
    let player: Player = this.mPlayerMap.get(id);
    if (player) {
      player.changeState(state);
    }
  }

  private onSetPosition(packet: PBpacket) { }


  get roomManager(): IRoomManager {
    return this.mRoomMgr;
  }

  get roomService(): RoomService {
    return this.mRoom;
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }

  public dispose() {
    if (this.mPlayerMap) {
      this.mPlayerMap.forEach((player: Player) => {
        player.disopse();
      });
      this.mPlayerMap = null;
    }
  }
}
