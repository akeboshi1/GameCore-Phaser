import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { Game } from "src/game/game";
import { EventType } from "structure";
import { PlayerBag } from "./player.bag";
import { PlayerProperty } from "./player.property";
export class UserDataManager extends PacketHandler {
    private mCurRoomID: string;
    private readonly mPlayerBag: PlayerBag;
    private readonly mProperty: PlayerProperty;
    constructor(private game: Game) {
        super();
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

    clear() {
        this.removePackListener();
        this.playerBag.destroy();
        this.playerProperty.destroy();
    }

    destroy() {
        this.removePackListener();
        this.playerBag.destroy();
        this.playerProperty.destroy();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
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
        if (this.mProperty.rooms) {
            const curRoomid = this.mCurRoomID;
            for (const room of this.mProperty.rooms) {
                if (room.roomId === curRoomid) return true;
            }
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
            this.game.peer.workerEmitter(EventType.PACKAGE_SYNC_FINISH, content.packageName);
        }
    }
    private onUPDATE_PACKAGE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE = packet.content;
        this.playerBag.updatePackage(content);
        this.game.peer.workerEmitter(EventType.PACKAGE_UPDATE, content.packageName);
    }
    private onUPDATE_PLAYER_INFO(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO = packet.content;
        this.playerProperty.syncData(content);
        this.game.peer.workerEmitter(EventType.UPDATE_PLAYER_INFO, this.playerProperty);
    }
}