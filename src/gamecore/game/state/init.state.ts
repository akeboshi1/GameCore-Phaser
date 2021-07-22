import { Logger } from "structure";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export class InitState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    run(data) {
        super.run(data);
        const config = data;
        // ============
        Logger.getInstance().debug("createGame");
        Logger.getInstance().debug("render link onReady");
        this.mGame.createGame(config).then(() => {
            this.next();
        });
    }
    next() {
        this.mGame.login();
    }
}
