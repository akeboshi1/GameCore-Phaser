import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaOnline extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    fetchOnlineInfo(): void;
    fetchAnotherInfo(id: string): void;
    fetchPlayerInfo(): void;
    getBanlist(): Promise<any>;
    getHeadImgList(uids: string[]): Promise<any>;
    private onRetOnlineInfo;
    private onOtherCharacterInfo;
}
