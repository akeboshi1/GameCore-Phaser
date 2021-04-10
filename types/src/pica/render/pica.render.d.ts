import "tooqinggamephaser";
import "gamecoreRender";
import "dragonBones";
import "apowophaserui";
import { Render as BaseRender } from "gamecoreRender";
import { ILauncherConfig } from "structure";
export declare class Render extends BaseRender {
    constructor(config: ILauncherConfig, callBack?: Function);
    createManager(): void;
    switchDecorateMouseManager(): void;
}
