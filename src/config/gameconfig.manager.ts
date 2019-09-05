import { GameConfigService } from "./gameconfig.service";
import { WorldService } from "../game/world.service";
import { Console } from "../utils/log";
import { ResUtils } from "../utils/resUtil";
import { load } from "../utils/http";
import { Lite } from "game-capsule";

export class GameConfigManager implements GameConfigService {
  private mWorld: WorldService;
  private mGameConfig: Lite | undefined;

  constructor(world: WorldService) {
    this.mWorld = world;
  }

  public load(paths: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.loadConfigs(paths)
      .then((reqs: any[]) => {
        return this.decodeConfigs(reqs);
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  public getObject(id: number) {
    if (!this.mGameConfig) {
      return;
    }
    const obj = this.mGameConfig.getObject(id);
    return obj;
  }

  private loadConfigs(paths: string[]): Promise<any> {
    const promises = [];
    for (const path of paths) {
      promises.push(load(ResUtils.getGameConfig(path), "arraybuffer"));
    }
    return Promise.all(promises);
  }

  private decodeConfigs(reqs: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      for (const req of reqs) {
        const arraybuffer = req.response;
        if (arraybuffer) {
          try {
            this.mGameConfig = new Lite();
            this.mGameConfig.deserialize(new Uint8Array(req.response));
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          reject("error");
        }
      }
    });
  }

  get gameConfig(): Lite | undefined {
    return this.mGameConfig;
  }
}
