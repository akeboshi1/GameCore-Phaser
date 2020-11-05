import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { Game } from "src/game/game";
import { HttpService } from "src/game/loop/httpClock/http.service";
import { ModuleName } from "structure";
import { Logger } from "utils";
import { BasicModel } from "../basic/basic.model";
import { PicFriendEvent } from "./PicFriendEvent";

export class PicFriend extends BasicModel {
    private httpService: HttpService;
    private userId: string;
    constructor(game: Game) {
        super(game);
        this.httpService = game.httpService;
        if (!game.peer.render[ModuleName.ACCOUNT_NAME]) return;
        game.peer.render[ModuleName.ACCOUNT_NAME].accountData().then((accountData) => {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PLAYER_LIST, this.onPlayerListHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SEARCH_PLAYER, this.onSearchHandler);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO, this.onOwnerCharacterInfo);
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

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    private onPlayerListHandler(packet: PBpacket) {
        this.event.emit(PicFriendEvent.PLAYER_LIST, packet.content);
    }

    private onSearchHandler(packet: PBpacket) {
        this.event.emit(PicFriendEvent.SEARCH_RESULT, packet.content);
    }

    // public queryPlayerInfo() {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELF_PLAYER_INFO);
    //     this.connection.send(packet);
    // }
}
