import { ElementManager, IElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { IRoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { Room, RoomService } from "../room";
import { PlayerInfo } from "./playInfo";
import { DragonBonesDisplay } from "../display/dragonBones.display";
import { DisplayInfo } from "../display/display.info";
import { Tweens } from "phaser";
export class PlayerManager extends PacketHandler implements IElementManager {
  private mPlayerMap: Map<number, Player>;
  private mMainRoleInfo: PlayerInfo;
  constructor(private mRoom: Room) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.mMainRoleInfo = new PlayerInfo();
      this.mPlayerMap = new Map();
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
      this.addHandlerFun(1, this.onChangeState)
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
    let player: Player = new Player(this);
    (player.getDisplay() as DragonBonesDisplay).dragonBonesName = "bones_human01"//obj.avatar.id;
    this.mPlayerMap.set(obj.id, player);
    // if (this.initialize === false) {
    //   this._initialize = true;
    //   Globals.MessageCenter.emit(MessageType.PLAYER_DATA_INITIALIZE);
    // }
  }

  private onAdd(packet: PBpacket) {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    let content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER = packet.content;
    let players = content.actors;
    if (players) {
      let displayInfo: DisplayInfo;
      let plyer: Player;
      for (let player of players) {
        plyer = new Player(this);
        displayInfo = new DisplayInfo();
        displayInfo.setInfo(player);
        plyer.load(displayInfo);
        this.mRoom.addToSurface(plyer.getDisplay());
        this.mPlayerMap.set(player.id || 0, plyer);
      }
    }
  }

  private onRemove(packet: PBpacket) {

  }

  private onMove(packet: PBpacket) {
    const content: op_client.IOP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER = packet.content;
    if (content.moveData) {
      let moveDataList: op_client.IMoveData[] = content.moveData
      let len: number = moveDataList.length;
      let moveData: op_client.IMoveData;
      let playID: number;
      let player: Player;
      for (let i: number = 0; i < len; i++) {
        moveData = moveDataList[i];
        playID = moveData.moveObjectId;
        player = this.mPlayerMap.get(playID);
        console.log(player.x + "," + player.y + ":" + moveData.destinationPoint3f.x + "," + moveData.destinationPoint3f.y + ":" + moveData.timeSpan);
        if (!player) {
          continue;
        }
        player.move(moveData);
      }
    }


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
