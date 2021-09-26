import { IRoomService } from "../room";
import { IScenery } from "structure";
import { Game } from "../../game";
export interface ISkyBoxConfig {
  key: string;
  width: number;
  height: number;
  gridW?: number;
  gridH?: number;
}

export class SkyBoxManager {
  protected mRoom: IRoomService;
  protected mScenetys: Map<number, IScenery>;
  protected mGame: Game;
  constructor(room: IRoomService) {
    this.mRoom = room;
    this.mGame = room.game;
    this.mScenetys = new Map();
  }

  add(scenery: IScenery) {
    // const blockManager = new BlockManager(scenery, this.mRoom);
    this.mScenetys.set(scenery.id, scenery);
    this.mGame.renderPeer.addSkybox(scenery);
    // if (this.mStateMap) {
    //   blockManager.setState(this.mStateMap);
    // }
  }

  update(scenery: IScenery) {
    // const block = this.mScenetys.get(scenery.id);
    // if (block) {
    //   block.update(scenery);
    // }
  }

  remove(id: number) {
    const block = this.mScenetys.get(id);
    if (block) {
      // block.destroy();
    }
  }

  resize(width: number, height: number) {
    if (!this.mScenetys) {
      return;
    }
    this.mScenetys.forEach((scenety) => {
      // scenety.resize(width, height);
    });
  }

  destroy() {
    // this.mScenetys.forEach((scenery: BlockManager) => scenery.destroy());
    this.mScenetys.forEach((scenery: IScenery) => this.mGame.renderPeer.removeSkybox(scenery.id));
    this.mScenetys.clear();
    this.mGame = null;
    this.mRoom = null;
  }

  get scenery(): IScenery[] {
    return Array.from(this.mScenetys.values());
  }
}
