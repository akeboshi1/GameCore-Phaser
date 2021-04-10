import { BasicMediator, Game } from "gamecore";
export declare class TaskMediator extends BasicMediator {
    private task;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    private onHideView;
    private onQueryQuestList;
    private onQueryQuestDetail;
    private onQuerySubmitQuest;
    private onRetQuestList;
    private onRetQuestDetail;
}
