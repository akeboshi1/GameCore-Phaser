/*
 * @Author: your name
 * @Date: 2020-11-04 20:52:32
 * @LastEditTime: 2020-11-05 16:06:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /game-core/src/game/ui/CharacterInfo/CharacterInfo.ts
 */
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_pkt_def } from "pixelpai_proto";
import { Game } from "src/game/game";
import { BasicModel } from "../basic/basic.model";

export class CharacterInfo extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO, this.onOwnerCharacterInfo);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO, this.onOtherCharacterInfo);
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

    public queryPlayerInfo() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELF_PLAYER_INFO);
        this.connection.send(packet);
    }

    public track(id: string) {
        this.playerInteraction(id, op_pkt_def.PKT_PlayerInteraction.PKT_tracePlayer);
    }

    public invite(id: string) {
        this.playerInteraction(id, op_pkt_def.PKT_PlayerInteraction.PKT_invitePlayer);
    }

    private playerInteraction(id: string, method: op_pkt_def.PKT_PlayerInteraction) {
        const param = op_def.GeneralParam.create();
        param.t = op_def.GeneralParamType.str;
        param.valStr = id;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_INTERACTION);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_INTERACTION = packet.content;
        content.method = method;
        content.param = param;
        this.connection.send(packet);
    }

    private onOwnerCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO = packge.content;
        this.game.emitter.emit("ownerInfo", content);
    }

    private onOtherCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO = packge.content;
        this.game.emitter.emit("otherInfo", content);
    }
}
