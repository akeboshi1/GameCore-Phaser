import { BasicMediator, Game } from "gamecore";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { Task } from "./Task";
export class TaskMediator extends BasicMediator {
    private task: Task;
    constructor(game: Game) {
        super(ModuleName.PICATASK_NAME, game);
        this.task = new Task(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestList, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);
        this.game.emitter.on("questlist", this.onRetQuestList, this);
        this.game.emitter.on("questdetail", this.onRetQuestDetail, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICATASK_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestList, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);
        this.game.emitter.off("questlist", this.onRetQuestList, this);
        this.game.emitter.off("questdetail", this.onRetQuestDetail, this);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.task) {
            this.task.destroy();
            this.task = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHideView() {
        this.hide();
    }

    private onQueryQuestList() {
        this.task.queryQuestList();
    }

    private onQueryQuestDetail(id: string) {
        this.task.queryQuestDetail(id);
    }

    private onQuerySubmitQuest(id: string) {
        this.task.querySubmitQuest(id);
    }
    private onRetQuestList(quests: op_client.PKT_Quest[]) {
        this.mView.setTaskDatas(quests);
    }

    private onRetQuestDetail(quest: op_client.PKT_Quest) {
        this.mView.setTaskDetail(quest);
    }
}
