import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { HttpService } from "../../net/http.service";

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
        this.userId = world.getConfig().user_id || "5f228eca28884d186ca2d542";
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
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

    getFolloweds() {
        return this.httpService.get(`user/${this.userId}/followeds`);
    }

    getFans() {
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

    // public queryPlayerInfo() {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELF_PLAYER_INFO);
    //     this.connection.send(packet);
    // }
}
