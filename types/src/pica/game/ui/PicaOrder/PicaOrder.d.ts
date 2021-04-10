import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_pkt_def } from "pixelpai_proto";
export declare class PicaOrder extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_WORLD_TEST(): void;
    query_ORDER_LIST(): void;
    query_CHANGE_ORDER_STAGE(index: number, state: op_pkt_def.PKT_Order_Operator): void;
    query_PLAYER_PROGRESS(name: string): void;
    query_PLAYER_PROGRESS_REWARD(index: number): void;
    private on_ORDER_LIST;
    private on_PLAYER_PROGRESS;
    private on_CLIENT_TEST;
}
