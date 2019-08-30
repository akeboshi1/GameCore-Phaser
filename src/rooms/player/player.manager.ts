import { IElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { Room, IRoomService } from "../room";
import { PlayerInfo } from "./playInfo";
import { DragonBonesDisplay } from "../display/dragonbones.display";
import { DisplayInfo } from "../display/display.info";
export class PlayerManager extends PacketHandler implements IElementManager {
  private mPlayerMap: Map<number, Player>;
  private mMainRoleInfo: PlayerInfo;
  constructor(private mRoom: Room) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);
      // this.mMainRoleInfo = new PlayerInfo();
      // this.mPlayerMap = new Map();
      // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
      // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
      // this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
      // this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
      // //todo playState change
      // this.addHandlerFun(1, this.onChangeState);
    }
  }

  public init() {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    if (!this.mMainRoleInfo) {
      this.mMainRoleInfo = new PlayerInfo();
    }
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
    // todo playState change
    this.addHandlerFun(1, this.onChangeState);
    this.mPlayerMap.clear();
  }

  public setMainRoleInfo(obj: op_client.IActor) {
    this.mMainRoleInfo.setInfo(obj);
    if (obj.walkOriginPoint) {
      this.mMainRoleInfo.setOriginWalkPoint(obj.walkOriginPoint);
    }
    if (obj.originPoint) {
      this.mMainRoleInfo.setOriginCollisionPoint(obj.originPoint);
    }
    const player: Player = new Player(this);
    const displayInfo: DisplayInfo = new DisplayInfo();
    displayInfo.setInfo(obj);
    player.load(displayInfo, () => {
      (player.getDisplay() as DragonBonesDisplay).dragonBonesName = "bones_human01"; // obj.avatar.id;
      player.setPosition(obj.x, obj.y, obj.z);
      this.mRoom.addToSurface(player.getDisplay());
    });
    this.mPlayerMap.set(obj.id, player);
    const cameraService = this.mRoom.cameraService;
    if (cameraService) {
      if (player.getDisplay()) cameraService.startFollow(player.getDisplay());
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

  private onAdd(packet: PBpacket) {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER = packet.content;
    const players = content.actors;
    if (players) {
      let displayInfo: DisplayInfo;
      let plyer: Player;
      for (const player of players) {
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
      const moveDataList: op_client.IMoveData[] = content.moveData;
      const len: number = moveDataList.length;
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
    const content = packet.content;
    const id: number = content.id;
    const state: string = content.state;
    const player: Player = this.mPlayerMap.get(id);
    if (player) {
      player.changeState(state);
    }
  }

  private onSetPosition(packet: PBpacket) { }

  get roomService(): IRoomService {
    return this.mRoom;
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }

  get connection(): ConnectionService {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    console.error("room is undefined");
  }
}
