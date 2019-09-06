import { GameConfigService } from "./gameconfig.service";
import { WorldService } from "../game/world.service";
import { ResUtils } from "../utils/resUtil";
import { load } from "../utils/http";
import { Lite } from "game-capsule";
import { IConfigObject } from "game-capsule/lib/configobjects/config_object";

export class GameConfigManager implements GameConfigService {
  private mWorld: WorldService;
  private mGameConfig: Lite | undefined;

  constructor(world: WorldService) {
    this.mWorld = world;
  }

  public load(paths: string[]): Promise<void> {
      return this.loadConfigs(paths)
        .then((reqs: any[]) => {
          return this.decodeConfigs(reqs);
        });
  }

  public getObject(id: number): IConfigObject | undefined {
    if (!this.mGameConfig) {
      return;
    }
    return this.mGameConfig.getObject(id);
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
            this.mGameConfig.deserialize(new Uint8Array(arraybuffer));
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
