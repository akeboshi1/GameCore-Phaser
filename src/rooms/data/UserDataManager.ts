import { WorldService } from "../../game/world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { PlayerBag } from "./PlayerBag";
import { PlayerProperty } from "./PlayerProperty";
export class UserDataManager extends PacketHandler {
    private mCurRoomID: string;
    private readonly mPlayerBag: PlayerBag;
    private readonly mProperty: PlayerProperty;
    private readonly mWorld: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor(world: WorldService) {
        super();
        this.mWorld = world;
        this.mEvent = new Phaser.Events.EventEmitter();
        this.mPlayerBag = new PlayerBag();
        this.mProperty = new PlayerProperty();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE, this.onSYNC_PACKAHE);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE, this.onUPDATE_PACKAGE);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO, this.onUPDATE_PLAYER_INFO);
    }

    public addPackListener() {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }
    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    clear() {
        this.removePackListener();
        this.playerBag.destroy();
        this.mEvent.removeAllListeners();
    }

    destroy() {
        this.removePackListener();
        this.mEvent.destroy();
        this.playerBag.destroy();
    }

    get connection(): ConnectionService {
        if (this.mWorld) {
            return this.mWorld.connection;
        }
    }

    get playerBag(): PlayerBag {
        if (this.mPlayerBag) {
            return this.mPlayerBag;
        }
    }

    get playerProperty(): PlayerProperty {
        if (this.mProperty) {
            return this.mProperty;
        }
    }

    get isSelfRoom() {
        const rooms = this.mProperty.rooms;
        const curRoomid = this.mCurRoomID;
        for (const room of rooms) {
            if (room.roomId === curRoomid) return true;
        }
        return false;
    }
    set curRoomID(roomID: string) {
        this.mCurRoomID = roomID;
    }

    get curRoomID() {
        return this.mCurRoomID;
    }

    querySYNC_ALL_PACKAGE() {
        this.querySYNC_PACKAGE(op_pkt_def.PKT_PackageType.PropPackage);
        this.querySYNC_PACKAGE(op_pkt_def.PKT_PackageType.AvatarPackage);
        this.querySYNC_PACKAGE(op_pkt_def.PKT_PackageType.FurniturePackage);
    }
    querySYNC_PACKAGE(packageType: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SYNC_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SYNC_PACKAGE = packet.content;
        content.packageName = packageType;
        this.connection.send(packet);
    }
    private onSYNC_PACKAHE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE = packet.content;
        const bag = this.playerBag.syncPackage(content);
        if (bag.syncFinish) {
            this.mEvent.emit("syncfinish", content.packageName);
        }
    }
    private onUPDATE_PACKAGE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE = packet.content;
        this.playerBag.updatePackage(content);
        this.mEvent.emit("update", content.packageName);
    }
    private onUPDATE_PLAYER_INFO(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO = packet.content;
        this.playerProperty.syncData(content);
        this.mEvent.emit("updateplayer", this.playerProperty);
    }
}
