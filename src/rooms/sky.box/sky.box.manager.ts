import { BlockManager } from "./block.manager";
import { IRoomService } from "../room";
import { IScenery } from "./scenery";
import { PacketHandler } from "net-socket-packet";

export interface ISkyBoxConfig {
  key: string;
  width: number;
  height: number;
  gridW?: number;
  gridH?: number;
}

export class SkyBoxManager extends PacketHandler {
  protected mRoom: IRoomService;
  protected mScenetys: Map<number, BlockManager>;
  constructor(room: IRoomService) {
    super();
    this.mRoom = room;
    this.mScenetys = new Map();
  }

  add(scenery: IScenery) {
    this.mScenetys.set(scenery.id, new BlockManager(scenery, this.mRoom));
  }

  update(scenery: IScenery) {
    const block = this.mScenetys.get(scenery.id);
    if (block) {
      block.update(scenery);
    }
  }

  remove(id: number) {
    const block = this.mScenetys.get(id);
    if (block) {
      block.destroy();
    }
  }

  destroy() {
    if (this.mRoom) {
      const connection = this.mRoom.connection;
      if (connection) {
        connection.removePacketListener(this);
      }
    }
    this.mScenetys.forEach((scenery: BlockManager) => scenery.destroy());
  }
}
