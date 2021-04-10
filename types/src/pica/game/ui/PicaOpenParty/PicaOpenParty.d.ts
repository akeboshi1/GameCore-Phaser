import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaOpenParty extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_PARTY_REQUIREMENTS(id: string): void;
    query_CREATE_PARTY(id: string, topic: string, name: string, des: string, ticket: number): void;
    private on_PARTY_REQUIREMENTS;
}
