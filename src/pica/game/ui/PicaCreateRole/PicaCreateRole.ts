import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_gameconfig } from "pixelpai_proto";
export class PicaCreateRole extends BasicModel {
    private mParam: any;
    private mEvent: Map<string, any> = new Map();
    constructor(game: Game) {
        super(game);
    }

    register() {
        const connection = this.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE, this.onCreateErrorHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_GENERATE_NEW_NAME, this.onGenerateNameHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public onRandomNameHandler() {
        const connection = this.game.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE_GENERATE_NEW_NAME);
        connection.send(packet);
    }

    public onSubmitHandler(name: string, index: number, avatar?: op_gameconfig.IAvatar) {
        const connection = this.game.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CREATE_ROLE = packet.content;
        content.name = name;
        // content.avatar = avatar;
        content.index = index;
        connection.send(packet);
    }

    private onCreateErrorHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE = packet.content;
        const error = this.mEvent.get("error");
        if (error) {
            const { listener, context, once } = error;
            listener.call(context, content);
            if (once) this.mEvent.delete("error");
        }
    }

    private onGenerateNameHandler(packet: PBpacket) {
        this.game.emitter.emit("GenerateName", packet.content.name);
    }
}
