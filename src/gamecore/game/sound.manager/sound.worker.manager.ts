import { Game } from "../game";
import { ConnectionService } from "../../../../lib/net";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
export class SoundWorkerManager extends PacketHandler {
    constructor(protected game: Game) {
        super();
    }

    addPackListener() {
        const connection = this.game.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL, this.onPlaySoundHandler);
        }
    }

    removePacketListener() {
        const connection = this.game.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    }

    stopAll() {
        this.game.renderPeer.stopAllSound();
    }

    pauseAll() {
        this.game.renderPeer.pauseAllSound();
    }

    resume() {
        this.game.renderPeer.resumeSound();
    }

    destroy() {
        this.removePacketListener();
    }

    private onPlaySoundHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL = packet.content;
        if (content.loop === undefined) {
            content.loop = true;
        }
        this.game.peer.render.playOsdSound(content);
    }

    get connection(): ConnectionService | undefined {
        return this.game.connection;
    }
}
