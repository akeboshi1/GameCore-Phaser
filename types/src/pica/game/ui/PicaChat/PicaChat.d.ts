import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_def } from "pixelpai_proto";
export declare class PicaChat extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    sendMessage(val: string): void;
    sendTest(): void;
    handleTest(packet: PBpacket): void;
    destroy(): void;
    queryMarket(marketName: string, page: number, category: string, subCategory: string): void;
    buyMarketCommodities(commodities: op_def.IOrderCommodities[]): void;
    queryGoHome(): void;
    private handleCharacterChat;
    private onQueryMarketHandler;
    get connection(): ConnectionService;
}
