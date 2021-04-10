import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaFurniFun extends PacketHandler {
    private game;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    queryUnlockElement(ids: number[]): void;
    queryTeamBuild(ids: number[]): void;
    onTeamBuildRequirement(packet: PBpacket): void;
    get connection(): ConnectionService;
}
