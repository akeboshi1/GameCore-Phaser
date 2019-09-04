import { GameConfigService } from "./gameconfig.service";
import { op_gameconfig_01 } from "pixelpai_proto";
import { WorldService } from "../game/world.service";
import { Console } from "../utils/log";
import { ResUtils } from "../utils/resUtil";
import { load } from "../utils/http";
import { url } from "inspector";

export class GameConfigManager implements GameConfigService {
  private mWorld: WorldService;
  private mGameConfig: op_gameconfig_01.IGame | undefined;
  constructor(world: WorldService) {
    this.mWorld = world;
  }

  load(paths: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const promises = [];
      for (const path of paths) {
        promises.push(load(ResUtils.getGameConfig(path), "arraybuffer"));
      }
      return Promise.all(promises)
      .then((reqs) => {
        for (const req of reqs) {
          const arraybuffer = req.response;
          if (arraybuffer) {
            try {
              this.mGameConfig = op_gameconfig_01.Game.decode(new Uint8Array(req.response));
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            reject("error");
          }
        }
      });
    });
  }

  get gameConfig(): op_gameconfig_01.IGame | undefined {
    return this.mGameConfig;
  }
}
