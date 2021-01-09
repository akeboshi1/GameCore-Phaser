import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaRoam extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_STATUS_RESULT, this.onRetRoamListResult);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_RESULT, this.onRetRoamDrawResult);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS, this.on_Draw_PROGRESS);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    destroy() {
        this.unregister();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public query_ROAM_LIST() {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DRAW_STATUS);
        this.connection.send(pkt);
    }

    public query_ROAM_DRAW(id: string) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DRAW);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DRAW = pkt.content;
        content.id = id;
        this.connection.send(pkt);
    }

    public query_PROGRESS_REWARD(name: string, index: number) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD = pkt.content;
        content.name = name;
        content.index = index;
        this.connection.send(pkt);
    }

    private onRetRoamListResult(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_STATUS_RESULT = packet.content;
        this.event.emit(ModuleName.PICAROAM_NAME + "_retquestlist", content.pools);
    }

    private onRetRoamDrawResult(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_RESULT = packet.content;
        this.event.emit(ModuleName.PICAROAM_NAME + "_retquestdraw", content);
    }
    private on_Draw_PROGRESS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS = packet.content;
        this.event.emit(ModuleName.PICAROAM_NAME + "_retprogresslist", content);
    }
}
