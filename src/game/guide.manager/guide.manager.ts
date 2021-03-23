import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BaseDataConfigManager } from "picaWorker";

export class GuideManager extends PacketHandler {
    constructor(protected game: Game) {
        super();
    }

    public addPackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_GUIDE_DATA, this.onUPDATE_PLAYER_GUIDE);
    }

    public removePackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
    }

    public stopGuide(id: string) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        if (!configMgr) return;
        configMgr.updateGuideState(id, true);
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_FINISH_GUIDE);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_FINISH_GUIDE = packet.content;
        content.index = Number(id);
        this.game.connection.send(packet);
    }

    public destroy() {
        this.removePackListener();
    }

    private onUPDATE_PLAYER_GUIDE(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_GUIDE_DATA = packet.content;
        const ids = content.finishedGuide;
        if (!ids || ids.length < 1) return;
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        ids.forEach((id) => {
            configMgr.updateGuideState(String(id), true);
        });
    }
}
