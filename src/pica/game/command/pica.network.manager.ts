import { NetworkManager } from "gamecore";
import { TestCommandHandler } from "./tset.command.handler";

export class PicaNetworkManager extends NetworkManager {
    protected testCommand: TestCommandHandler;
    init() {
        super.init();
        this.testCommand = new TestCommandHandler(this.mGame);
    }

    destory() {
        this.testCommand.destroy();
    }
}
