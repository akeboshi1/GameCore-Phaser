import { BaseConfigData, Game, MainPeer } from "gamecore";
import { BaseDataType } from "./config";
export declare class PicaGame extends Game {
    constructor(peer: MainPeer);
    getBaseConfig<T extends BaseConfigData>(type: BaseDataType): T;
    preloadGameConfig(): Promise<any>;
    protected createManager(): void;
}
