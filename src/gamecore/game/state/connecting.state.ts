import { Logger, ServerAddress, SocketState, LoadState } from "structure";
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
            this.mMain.render.showAlert("loading.login_error", true, true)
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
            this.mGame.loadingManager.start(LoadState.CONNECTING);
        }
    }

    update(data?: any) {
        // 告诉主进程链接成功
        this.mGame.renderPeer.onConnected(data);
        this.mGame.isAuto = data || false;
        if (!this.mGame.clock) this.mGame.clock = new Clock(this.mGame.connection, this.mGame.peer, this.mGame);
        if (!this.mGame.httpClock) this.mGame.httpClock = new HttpClock(this.mGame);
        Logger.getInstance().info(`enterVirtualWorld`);
        this.mGame.connection.connect = SocketState.link;
        this.next();
    }
    next() {
        this.mGame.loginEnterWorld();
    }
}
