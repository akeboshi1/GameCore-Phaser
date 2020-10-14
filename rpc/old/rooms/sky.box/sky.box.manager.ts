import { BlockManager } from "./block.manager";
import { IRoomService } from "../room";
import { IScenery } from "./scenery";
import { PacketHandler } from "net-socket-packet";
import { State } from "../state/state.group";

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
  protected mStateMap: Map<string, State>;
  constructor(room: IRoomService) {
    super();
    this.mRoom = room;
    this.mScenetys = new Map();
  }

  add(scenery: IScenery) {
    // if (scenery.id === 1896802976) {
    //   return;
    // }
    const blockManager = new BlockManager(scenery, this.mRoom);
    this.mScenetys.set(scenery.id, blockManager);
    // if (this.mStateMap) {
    //   blockManager.setState(this.mStateMap);
    // }
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

  setState(states: State) {
    if (!this.mStateMap) {
      this.mStateMap = new Map();
    }
    this.mStateMap.set(states.name, states);
    this.mScenetys.forEach((block) => {
      block.setState(states);
    });
  }

  resize(width: number, height: number) {
    if (!this.mScenetys) {
      return;
    }
    this.mScenetys.forEach((scenety) => {
      scenety.resize(width, height);
    });
  }

  destroy() {
    if (this.mRoom) {
      const connection = this.mRoom.connection;
      if (connection) {
        connection.removePacketListener(this);
      }
    }
    this.mScenetys.forEach((scenery: BlockManager) => scenery.destroy());
    this.mScenetys.clear();
  }

  get scenery(): BlockManager[] {
    return Array.from(this.mScenetys.values());
  }
}
