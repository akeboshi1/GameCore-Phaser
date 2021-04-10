import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaMineSettle extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    reqMineSettlePacket(): void;
    destroy(): void;
    get connection(): ConnectionService;
    private onMineSettlePackageHandler;
}
