import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaNewRole extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    fetchAnotherInfo(id: string): void;
    queryAction(uiid: number, cid: string, action: number): void;
    private onOtherCharacterInfo;
}
