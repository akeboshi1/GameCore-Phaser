import { Logger } from "utils";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
import version from "../../../version";
import { LoadState } from "structure";
import { PBpacket } from "net-socket-packet";
import { op_gateway } from "pixelpai_proto";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
export class EnterWorldState extends BaseState {
    constructor(main: MainPeer, key: string) {
        super(main, key);
    }
    run() {
        const game = this.mMain.game;
        // =============> enterworld内部逻辑
        Logger.getInstance().debug("loginEnterWorld");
        game.loadingManager
            .start(LoadState.ENTERWORLD, { render: "构建现实世界" + `_v${version}`, main: "构建魔法世界" + `_v${version}`, physical: "构建物理世界" + `_v${version}` })
            .then(game.renderPeer.hideLogin());
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        const config = game.getGameConfig();
        Logger.getInstance().debug(`VW_id: ${config.virtual_world_id}`);
        let game_id = config.game_id;
        let virtualWorldUuid = config.virtual_world_id;
        const worldId = config.world_id;
        let sceneId = null;
        let loc = null;
        let spawnPointId = null;
        const account = await game.peer.render.getAccount();
        const accountData = account.accountData;
        if (account && account.gameId) {
            game_id = account.gameId;
            virtualWorldUuid = account.virtualWorldId;
            sceneId = account.sceneID;
            loc = account.loc;
            spawnPointId = account.spawnPointId;
        }
        content.virtualWorldUuid = virtualWorldUuid;
        content.gameId = game_id;
        content.userToken = config.auth_token = accountData.accessToken;
        content.expire =config.token_expire = accountData.expire + "";
        content.fingerprint = config.token_fingerprint = accountData.fingerprint;
        content.sceneId = sceneId;
        content.worldUuid = worldId;
        // 后端有个Bug，loc是undefined位置会错误。修复后删掉{ locX: 0, locY: 0, locZ: 0}
        content.loc = loc || { locX: 0, locY: 0, locZ: 0 };
        content.spawnPointId = spawnPointId;
        game.connection.send(pkt);
        if (game.clock) game.clock.startCheckTime();
        if (game.httpClock) game.httpClock.gameId = game_id;
    }
    next() {

    }
}
