import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { HttpService } from "../../../lib/net/http.service";
import { Logger } from "../../game/core/utils/log";
import { PicFriendEvent } from "./PicFriendEvent";

export class PicFriend extends PacketHandler {
    private readonly world: WorldService;
    private httpService: HttpService;
    private mEvent: Phaser.Events.EventEmitter;
    private userId: string;
    constructor(world: WorldService) {
        super();
        this.world = world;
        this.mEvent = new Phaser.Events.EventEmitter();
        this.httpService = world.httpService;
        if (world.account && world.account.accountData) this.userId = world.account.accountData.id;
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

    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    destroy() {
        this.unregister();
        this.mEvent.destroy();
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

    getFolloweds() {
        if (!this.userId) {
            Logger.getInstance().error("fetch follow error, userId does not exist");
            return;
        }
        return this.httpService.get(`user/${this.userId}/followeds`);
    }

    getFans() {
        if (!this.userId) {
            Logger.getInstance().error("fetch fans error, userId does not exist");
            return;
        }
        return this.httpService.get(`user/${this.userId}/fans`);
    }

    getBanlist() {
        return this.httpService.get(`user/banlist`);
    }

    getFriends() {
        return this.httpService.get(`user/friends`);
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }

    private onPlayerListHandler(packet: PBpacket) {
        this.mEvent.emit(PicFriendEvent.PLAYER_LIST, packet.content);
    }

    private onSearchHandler(packet: PBpacket) {
        this.mEvent.emit(PicFriendEvent.SEARCH_RESULT, packet.content);
    }

    // public queryPlayerInfo() {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELF_PLAYER_INFO);
    //     this.connection.send(packet);
    // }
}
