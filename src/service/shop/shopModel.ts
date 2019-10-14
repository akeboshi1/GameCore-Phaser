import { PacketHandler, PBpacket } from "net-socket-packet";
import { IBaseModel } from "../baseModel";
import { op_client } from "pixelpai_proto";
import { WorldService } from "../../game/world.service";
import { MessageType } from "../../const/MessageType";
import { ConnectionService } from "../../net/connection.service";

export class ShopModel extends PacketHandler implements IBaseModel {
    public static NAME: string = "ShopModel";
    public initialize: boolean;
    private mConnect: ConnectionService;
    constructor(private mWorld: WorldService) {
        super();
        this.mWorld.connection.addPacketListener(this);
        this.mConnect = this.mWorld.connection;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE, this.handlerQueryPackage);
    }
    public getInitialize(): boolean {
        return this.initialize;
    }

    public register() {
        this.mConnect.addPacketListener(this);

    }

    public unRegister() {
        this.mConnect.removePacketListener(this);
    }

    public destroy() {
        this.initialize = false;
        this.mConnect = null;
    }

    private handlerQueryPackage(packet: PBpacket) {
        const notice: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE = packet.content;
        this.mWorld.modelManager.emit(MessageType.QUERY_PACKAGE, notice);
    }
}
