import { State } from "../state/state.group";
import { IRoomService } from "../room/room";
import { IScenery } from "structure";
import { Game } from "src/game/game";

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
  protected mStateMap: Map<string, State>;
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

  setState(states: State) {
    if (!this.mStateMap) {
      this.mStateMap = new Map();
    }
    this.mStateMap.set(states.name, states);
    this.mGame.renderPeer.updateSkyboxState(states);
    // this.mScenetys.forEach((block) => {
      // block.setState(states);
    // });
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
  }

  get scenery(): IScenery[] {
    return Array.from(this.mScenetys.values());
  }
}
