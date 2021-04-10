import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaPlayerInfo extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryPlayerInfo(): void;
    track(id: string): void;
    invite(id: string): void;
    goOtherHome(id: string): void;
    private playerInteraction;
    private onOwnerCharacterInfo;
    private onOtherCharacterInfo;
}
