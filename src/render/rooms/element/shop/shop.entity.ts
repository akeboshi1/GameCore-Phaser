import { PacketHandler, PBpacket } from "net-socket-packet";
import { IEntity } from "../../entity";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { WorldService } from "../../../game/world.service";
import { op_client } from "pixelpai_proto";
import { MessageType } from "../../../const/MessageType";

export class ShopEntity extends PacketHandler implements IEntity {
    public static NAME: string = "ShopModel";
    private mConnect: ConnectionService;
    private mInitialize: boolean = false;
    constructor(private mWorld: WorldService) {
        super();
        this.mConnect = this.mWorld.connection;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE, this.handlerQueryPackage);
    }

    public initialize(): boolean {
        return this.mInitialize;
    }

    public register() {
        this.mConnect.addPacketListener(this);
    }

    public unRegister() {
        this.mConnect.removePacketListener(this);
    }

    public destroy() {
        this.unRegister();
        this.mInitialize = false;
        this.mConnect = null;
    }

    private handlerQueryPackage(packet: PBpacket) {
        const notice: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE = packet.content;
        this.mWorld.emitter.emit(MessageType.QUERY_PACKAGE, notice);
    }
}
