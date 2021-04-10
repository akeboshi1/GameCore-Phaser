import { NetworkManager } from "gamecore";
import { PicaCommonHandler } from "./pica.common.handler";
import { TestCommandHandler } from "./tset.command.handler";

export class PicaNetworkManager extends NetworkManager {
    protected testCommand: TestCommandHandler;
    protected commondHandler: PicaCommonHandler;
    init() {
        super.init();
        this.testCommand = new TestCommandHandler(this.mGame);
        this.commondHandler = new PicaCommonHandler(this.mGame);
    }

    destory() {
        this.testCommand.destroy();
    }
}
