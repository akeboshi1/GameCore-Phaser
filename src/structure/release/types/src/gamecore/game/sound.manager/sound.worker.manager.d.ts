import { Game } from "../game";
import { ConnectionService } from "structure";
import { PacketHandler } from "net-socket-packet";
export declare class SoundWorkerManager extends PacketHandler {
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
