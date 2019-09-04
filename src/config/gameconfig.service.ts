import { op_gameconfig_01 } from "pixelpai_proto";

export interface GameConfigService {
  readonly gameConfig: op_gameconfig_01.IGame;

  load(path: string[]): Promise<void>;
}
