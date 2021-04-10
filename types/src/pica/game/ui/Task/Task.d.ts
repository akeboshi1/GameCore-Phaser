import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class Task extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryQuestList(): void;
    queryQuestDetail(id: string): void;
    querySubmitQuest(id: string): void;
    private onRetQuestList;
    private onRetQuestDetail;
}
