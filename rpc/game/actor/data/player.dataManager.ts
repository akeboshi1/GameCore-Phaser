import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { PlayerData } from "./player.data";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { Game } from "../../game";
export class PlayerDataManager extends PacketHandler {
    private readonly mPlayerData: PlayerData;
    private readonly mGame: Game;
    constructor(game: Game) {
        super();
        this.mGame = game;
        this.mPlayerData = new PlayerData();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE, this.onSYNC_PACKAHE);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE, this.onUPDATE_PACKAGE);
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
    // on(event: string | symbol, fn: Function, context?: any) {
    //     this.mEvent.on(event, fn, context);
    // }

    // off(event: string | symbol, fn: Function, context?: any) {
    //     this.mEvent.off(event, fn, context);
    // }

    clear() {
        this.removePackListener();
        this.playerData.destroy();
        // this.mEvent.removeAllListeners();
    }

    destroy() {
        this.removePackListener();
        // this.mEvent.destroy();
        this.playerData.destroy();
    }

    get connection(): ConnectionService {
        if (this.mGame) {
            return this.mGame.connection;
        }
    }

    get playerData(): PlayerData {
        if (this.mPlayerData) {
            return this.mPlayerData;
        }
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
        const bag = this.playerData.syncPackage(content);
        if (bag.syncFinish) {
            // todo render emit syncfinish
            // this.mEvent.emit("syncfinish", content.packageName);
        }
    }
    private onUPDATE_PACKAGE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE = packet.content;
        this.playerData.updatePackage(content);
        // todo render emit update
        // this.mEvent.emit("update", content.packageName);
    }
}
