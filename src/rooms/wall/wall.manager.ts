import { IRoomService } from "../room";
import { Wall, Direction } from "./wall";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";

export class WallManager extends PacketHandler  {
  private mWalls: Map<number, Wall> = new Map<number, Wall>();
  constructor(protected mRoom: IRoomService) {
    super();

    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.onDawWallHandler);
  }

  protected _add(x: number, y: number, dir: Direction) {
    const wall = new Wall();
  }

  private onDawWallHandler(packet: PBpacket) {
    const terrain = this.mRoom.terrainManager;
  }
}
