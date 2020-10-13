import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Game } from "../../game/game";
import { IRoomService } from "../room/roomManager/room/room";

export enum SoundField {
    Background,
    Element,
    Effect
}

export interface ISoundConfig {
    key?: string;
    urls?: string | string[];
    field?: SoundField;
    // soundConfig?: Phaser.Types.Sound.SoundConfig;
}

export class SoundManager extends PacketHandler {
    private readonly game: Game;
    constructor(game: Game) {
        super();
        this.game = game;
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

    changeRoom(room: IRoomService) {
        this.game.peer.render.soundChangeRoom(room.id);
    }

    destroy() {
        this.removePacketListener();
    }

    private onPlaySoundHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL = packet.content;
        if (content.loop === undefined) {
            content.loop = true;
        }
        this.game.peer.render.playSound(content);
    }
}
