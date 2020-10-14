import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { op_client } from "pixelpai_proto";
import { Game } from "../../game";
import { MessageType } from "../../../structureinterface/message.type";

export class ShopEntity extends PacketHandler {
    public static NAME: string = "ShopModel";
    private mConnect: ConnectionService;
    private mInitialize: boolean = false;
    constructor(private mGame: Game) {
        super();
        this.mConnect = this.mGame.connection;
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
        this.mGame.peer.render.emitter.emit(MessageType.QUERY_PACKAGE, packet);
    }
}
