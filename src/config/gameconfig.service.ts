import { op_gameconfig_01 } from "pixelpai_proto";
import { Lite } from "game-capsule";

export interface GameConfigService {
  readonly gameConfig: Lite;

  load(path: string[]): Promise<void>;
  getObject(id: number): any;
}
