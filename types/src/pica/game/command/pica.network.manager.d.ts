import { NetworkManager } from "gamecore";
import { PicaCommonHandler } from "./pica.common.handler";
import { TestCommandHandler } from "./tset.command.handler";
export declare class PicaNetworkManager extends NetworkManager {
    protected testCommand: TestCommandHandler;
    protected commondHandler: PicaCommonHandler;
    init(): void;
    destory(): void;
}
