import { op_gameconfig_01 } from "pixelpai_proto";
import { Lite } from "game-capsule";
import {IConfigObject} from "game-capsule/lib/configobjects/config_object";

export interface GameConfigService {
  readonly gameConfig: Lite;

  load(path: string[]): Promise<void>;
  getObject(id: number): IConfigObject | undefined;
}
