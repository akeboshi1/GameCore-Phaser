import { BasicMediator, Game } from "gamecore";
import { PicaTask } from "./PicaTask";
export declare class PicaTaskMediator extends BasicMediator {
    protected mModel: PicaTask;
    protected taskGroup: any;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    panelInit(): void;
    private onHideView;
    private onQueryQuestDetail;
    private onQueryQuestGroup;
    private onQueryQuestReward;
    private onQuerySubmitQuest;
    private onRetQuestList;
    private onRetQuestDetail;
    private onRetQuestGroup;
    private onGoHandler;
}
