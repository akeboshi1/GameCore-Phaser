import { Game } from "../game";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler } from "net-socket-packet";
export declare class SoundManager extends PacketHandler {
    protected game: Game;
    constructor(game: Game);
    addPackListener(): void;
    removePacketListener(): void;
    stopAll(): void;
    pauseAll(): void;
    resume(): void;
    destroy(): void;
    private onPlaySoundHandler;
    get connection(): ConnectionService | undefined;
}
