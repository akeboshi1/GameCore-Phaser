import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { Game } from "../../game";
import { EventType, ModuleName } from "structure";
import { PlayerBag } from "./player.bag";
import { PlayerProperty } from "./player.property";
import { SceneDataManager } from "../../data.manager/scene.data.manager";
import { DataMgrType } from "../../data.manager/dataManager";
export class UserDataManager extends PacketHandler {
    private mPlayerBag: PlayerBag;
    private mProperty: PlayerProperty;
    private mDressAvatarIDs: string[];
    constructor(private game: Game) {
        super();
        this.mPlayerBag = new PlayerBag();
        this.mProperty = new PlayerProperty();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE, this.onSYNC_PACKAHE);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE, this.onUPDATE_PACKAGE);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO, this.onUPDATE_PLAYER_INFO);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_DRESS_AVATAR_ITEM_ID, this.onRetDressAvatarItemIDS);
        this.proto.on("PKT_PLAYER_INFO", this.onUPDATE_PLAYER_INFO, this);
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
        this.proto.off("PKT_PLAYER_INFO", this.onUPDATE_PLAYER_INFO, this);
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

    get money(): number {
        if (this.mProperty && this.mProperty.coin) return this.mProperty.coin.value;
    }
    get diamond(): number {
        if (this.mProperty && this.mProperty.diamond) return this.mProperty.diamond.value;
        return 0;
    }
    get level(): number {
        if (this.mProperty && this.mProperty.level) return this.mProperty.level.value;
        return 0;
    }
    get energy(): number {
        if (this.mProperty && this.mProperty.energy) return this.mProperty.energy.value;
        return 0;
    }
    get reputationLevel(): number {
        if (this.mProperty && this.mProperty.reputationLevel) return this.mProperty.reputationLevel.value;
        return 0;
    }
    get popularityCoin(): number {
        if (this.mProperty && this.mProperty.popularityCoin) return this.mProperty.popularityCoin.value;
        return 0;
    }
    get isSelfRoom() {
        const dataMgr = this.game.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
        if (dataMgr.curRoom && dataMgr.curRoom.ownerId === this.cid) return true;
        return false;
    }

    get curRoomID() {
        const dataMgr = this.game.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
        return dataMgr.curRoomID;
    }
    get cid() {
        return this.playerProperty.cid;
    }
    get avatarIDs() {
        return this.mDressAvatarIDs;
    }

    querySYNC_ALL_PACKAGE() {
        this.mPlayerBag = new PlayerBag();
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
    public onSYNC_PACKAHE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_SYNC_PACKAGE = packet.content;
        this.syncItemBases(content.items);
        const bag = this.playerBag.syncPackage(content);
        if (bag.syncFinish) {
            this.game.peer.workerEmitter(EventType.PACKAGE_SYNC_FINISH, content.packageName);
            this.game.emitter.emit(EventType.PACKAGE_SYNC_FINISH, content.packageName);
        }
    }
    public onUPDATE_PACKAGE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_UPDATE_PACKAGE = packet.content;
        this.syncItemBases(content.items);
        this.playerBag.updatePackage(content);
        this.game.emitter.emit(EventType.PACKAGE_UPDATE, content.packageName);
        this.game.peer.workerEmitter(EventType.PACKAGE_UPDATE, content.packageName);
    }
    public onUPDATE_PLAYER_INFO(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO = packet.content;
        this.playerProperty.syncData(content);
        this.game.emitter.emit(EventType.UPDATE_PLAYER_INFO, this.playerProperty);
        this.game.peer.workerEmitter(EventType.UPDATE_PLAYER_INFO, this.playerProperty);
    }

    private syncItemBases(items: op_client.ICountablePackageItem[]) {
        const config = <any>this.game.configManager;
        for (const item of items) {
            if (item.id !== "-1")
                config.synItemBase(item);
        }
    }
    private onRetDressAvatarItemIDS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_DRESS_AVATAR_ITEM_ID = packet.content;
        this.mDressAvatarIDs = content.avatarItemIds;
        this.game.emitter.emit(EventType.RETURN_DRESS_AVATAR_IDS, content.avatarItemIds);
    }
    get proto() {
        return this.game.customProto;
    }
}
