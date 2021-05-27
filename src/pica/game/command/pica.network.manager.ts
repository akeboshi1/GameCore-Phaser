import { NetworkManager } from "gamecore";
import { PicaCommonHandler } from "./pica.common.handler";
import { PicaNewCommonHandler } from "./pica.new.common.handler";
import {TestCommandHandler} from "./test.command.handler";

export class PicaNetworkManager extends NetworkManager {
    protected testCommand: TestCommandHandler;
    protected commondHandler: PicaCommonHandler;
    protected newCommondHandler: PicaNewCommonHandler;
    init() {
        super.init();
        this.testCommand = new TestCommandHandler(this.mGame);
        this.commondHandler = new PicaCommonHandler(this.mGame);
        this.newCommondHandler = new PicaNewCommonHandler(this.mGame);
    }

    destory() {
        this.testCommand.destroy();
        this.commondHandler.destroy();
        this.newCommondHandler.destroy();
    }
}
