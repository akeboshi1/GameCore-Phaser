import { op_def } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaElementStorage extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    get connection(): ConnectionService;
    /**
     * 请求编辑背包
     */
    queryPackage(page: number, perPage: number, nodeType?: op_def.NodeType, queryString?: string): void;
    queryMarketPackage(page: number, perPage: number, nodeType?: op_def.NodeType, queryString?: string): void;
    destroy(): void;
    private onQueryEditPackageResuleHandler;
    private onQueryMarketPacketResuleHandler;
}
