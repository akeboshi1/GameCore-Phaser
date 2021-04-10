import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_pkt_def } from "pixelpai_proto";
export declare class PicaTask extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    queryQuestList(): void;
    queryQuestGroup(type: op_pkt_def.PKT_Quest_Type): void;
    queryGroupRewards(type: op_pkt_def.PKT_Quest_Type): void;
    queryQuestDetail(id: string): void;
    querySubmitQuest(id: string): void;
    private onRetQuestList;
    private onRetQuestDetail;
    private onRetQuestMainGroup;
}
