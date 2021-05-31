import { ServerAddress } from "lib/net/address";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";

export class ConnectingState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    run() {
        const config = this.mMain.config;
        const game = this.mMain.game;
        const gateway: ServerAddress = config.server_addr;
        if (!gateway || !gateway.host || !gateway.port) {
            this.mMain.render.showAlert("登录失败，请重新登录或稍后再试", true, false)
                .then(async () => {
                    await this.mMain.render.clearAccount();
                    game.login();
                });
            return;
        }
        if (gateway) {
            // connect to game server.
            const addr: ServerAddress = { host: gateway.host, port: gateway.port, secure: gateway.secure };
            game.connection.startConnect(addr);
        }
    }
    update(){
        
    }
}
