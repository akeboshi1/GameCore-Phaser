import { BasicModel, Game, HttpService } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { Logger } from "utils";

export class PicaNewFriend extends BasicModel {
    private httpService: HttpService;
    private userId: string;
    constructor(game: Game) {
        super(game);
        this.httpService = game.httpService;
        if (!game.peer.render[ModuleName.ACCOUNT_NAME]) return;
        game.peer.render[ModuleName.ACCOUNT_NAME].getAccountData().then((accountData) => {
            if (accountData) {
                this.userId = accountData.id;
                this.register();
            }
        });
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PLAYER_LIST, this.onPlayerListHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SEARCH_PLAYER, this.onSearchHandler);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO, this.onOtherCharacterInfo);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    destroy() {
        this.unregister();
    }

    fetchFriendInfo(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ANOTHER_PLAYER_INFO);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ANOTHER_PLAYER_INFO = packet.content;
        content.platformId = id;
        this.connection.send(packet);
    }

    fetchFriendList(ids: string[]) {
        if (!ids || ids.length < 1) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_LIST);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_LIST = packet.content;
        content.platformIds = ids;
        this.connection.send(packet);
    }

    searchFriend(name: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SEARCH_PLAYER);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SEARCH_PLAYER = packet.content;
        content.name = name;
        this.connection.send(packet);
    }

    public track(id: string) {
        this.playerInteraction(id, op_pkt_def.PKT_PlayerInteraction.PKT_tracePlayer);
    }

    public invite(id: string) {
        this.playerInteraction(id, op_pkt_def.PKT_PlayerInteraction.PKT_invitePlayer);
    }
    public goOtherHome(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GO_OTHERS_HOME);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GO_OTHERS_HOME = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    getFolloweds(): Promise<any> {
        if (!this.userId) {
            Logger.getInstance().error("fetch follow error, userId does not exist");
            return;
        }
        return new Promise<any>((resolve) => { resolve(this.httpService.get(`user/${this.userId}/followeds`)); });
    }

    getFans(): Promise<any> {
        if (!this.userId) {
            Logger.getInstance().error("fetch fans error, userId does not exist");
            return;
        }
        return new Promise<any>((resolve) => { resolve(this.httpService.get(`user/${this.userId}/fans`)); });
    }

    getBanlist(): Promise<any> {
        return new Promise<any>((resolve) => { resolve(this.httpService.get(`user/banlist`)); });
    }

    getFriends(): Promise<any> {
        return new Promise<any>((resolve) => { resolve(this.httpService.get(`user/friends`)); });
    }
    getHeadImgList(uids: string[]): Promise<any> {
        return new Promise<any>((resolve) => { resolve(this.game.httpService.userHeadsImage(uids)); });
    }
    private onOtherCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO = packge.content;
        this.event.emit(ModuleName.PICANEWFRIEND_NAME + "_other", content);
    }
    private playerInteraction(id: string, method: op_pkt_def.PKT_PlayerInteraction) {
        const param = op_def.GeneralParam.create();
        param.t = op_def.GeneralParamType.str;
        param.valStr = id;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_INTERACTION);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_INTERACTION = packet.content;
        content.method = method;
        content.param = param;
        this.connection.send(packet);
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    private onPlayerListHandler(packet: PBpacket) {
        this.event.emit(EventType.PLAYER_LIST, packet.content);
    }

    private onSearchHandler(packet: PBpacket) {
        this.event.emit(EventType.SEARCH_RESULT, packet.content);
    }
}
