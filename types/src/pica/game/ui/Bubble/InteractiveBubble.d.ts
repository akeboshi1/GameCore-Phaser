import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class InteractiveBubble extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    queryInteractiveHandler(data: any): void;
    get connection(): ConnectionService;
    private onShowHandler;
    private onClearHandler;
}
