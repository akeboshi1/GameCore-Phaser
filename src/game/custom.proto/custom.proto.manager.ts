import { Game } from "gamecore";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import * as customProto from "custom_proto";
import { EventDispatcher, Logger } from "utils";

export class CustomProtoManager extends PacketHandler {
    private emitter: EventDispatcher;
    constructor(private game: Game) {
        super();
        this.emitter = new EventDispatcher();
        const connection = game.connection;
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CUSTOM_PROTO, this.onCustomHandler);
    }

    public send(msgName: string, cmd?: string, msg?: any) {
        // tslint:disable-next-line:new-parens
        const proto = customProto[msgName];
        if (!proto) {
            return Logger.getInstance().error(`${msgName} does not exist`);
        }
        const obj = proto.fromObject(msg || { });
        if (!obj) {
            return Logger.getInstance().error(`parse message ${msg.toString()} failed`);
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CUSTOM_PROTO);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_CUSTOM_PROTO = packet.content;
        content.msgName = msgName;
        content.cmd = cmd;
        content.msg = proto.encode(obj).finish();
        this.connection.send(packet);
    }

    public on(type: string, listener: Function, caller: any, args: any[] = null) {
        this.emitter.on(type, caller, listener, args);
    }

    public once(type: string, listener: Function, caller: any, args: any[] = null) {
        this.emitter.once(type, caller, listener, args);
    }

    public off(type: string, listener: Function, caller: any, onceOnly: Boolean = false) {
        this.emitter.off(type, listener, caller, onceOnly);
    }

    public destroy() {
        this.emitter.destroy();
        const connection = this.game.connection;
        connection.removePacketListener(this);
    }

    private onCustomHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CUSTOM_PROTO = packet.content;
        const { msgName, cmd, msg } = content;
        const proto = customProto[msgName];
        if (!proto) {
            return Logger.getInstance().error(`${msgName} does not exist`);
        }
        this.emitter.emit(content.msgName, { cmd, content: proto.decode(msg) });
    }

    private get connection() {
        return this.game.connection;
    }
}
