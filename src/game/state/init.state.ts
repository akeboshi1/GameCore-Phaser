import { Logger, Url } from "utils";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export class InitState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    run(data) {
        super.run(data);
        const config = data;
        Url.OSD_PATH = config.osd;
        Url.RES_PATH = `resources/`;
        Url.RESUI_PATH = `${Url.RES_PATH}ui/`;
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
