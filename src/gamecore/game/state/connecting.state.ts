import { ServerAddress } from "lib/net/address";
import { ModuleName } from "structure";
import { Logger } from "utils";
import { Clock, HttpClock } from "../loop";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export class ConnectingState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    run() {
        super.run();
        const config = this.mMain.config;
        const gateway: ServerAddress = config.server_addr;
        if (!gateway || !gateway.host || !gateway.port) {
            this.mMain.render.showAlert("登录失败，请重新登录或稍后再试", true, false)
                .then(async () => {
                    await this.mMain.render.clearAccount();
                    this.mGame.login();
                });
            return;
        }
        if (gateway) {
            // connect to this.mGame server.
            const addr: ServerAddress = { host: gateway.host, port: gateway.port, secure: gateway.secure };
            this.mGame.connection.startConnect(addr);
        }
    }
    update(data?: any) {
        // 告诉主进程链接成功
        this.mGame.renderPeer.onConnected(data);
        this.mGame.isAuto = data || false;
        if (!this.mGame.clock) this.mGame.clock = new Clock(this.mGame.connection, this.mGame.peer, this.mGame);
        if (!this.mGame.httpClock) this.mGame.httpClock = new HttpClock(this.mGame);
        this.mGame.hideMediator(ModuleName.PICA_BOOT_NAME);
        Logger.getInstance().info(`enterVirtualWorld`);
        this.mGame.connection.connect = true;
        this.next();
    }
    next() {
        this.mGame.loginEnterWorld();
    }
}
