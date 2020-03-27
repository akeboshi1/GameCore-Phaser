import { IRoomService } from "../room";
import { Wall, Direction } from "./wall";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Pos } from "../../utils/pos";
export class WallManager extends PacketHandler  {
  private mWalls: Map<number, Wall> = new Map<number, Wall>();
  constructor(protected mRoom: IRoomService) {
    super();

    if (this.mRoom.connection) {
      this.mRoom.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.onDawWallHandler);
    }
  }

  protected _add(x: number, y: number, dir: Direction) {
    // const wall = new Wall(this.mRoom);
    // wall.setPosition(x, y);
  }

  private onDawWallHandler(packet: PBpacket) {
    const terrain = this.mRoom.terrainManager;
    const pos = this.mRoom.transformTo90(new Pos(0, 0));
    this._add(pos.x, pos.y, Direction.UP);
  }
}
