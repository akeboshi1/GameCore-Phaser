import { BasicMediator, Game } from "gamecore";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { PicaTask } from "./PicaTask";
export class PicaTaskMediator extends BasicMediator {
    protected mModel: PicaTask;
    constructor(game: Game) {
        super(ModuleName.PICATASK_NAME, game);
        this.mModel = new PicaTask(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestList, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);

        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestlist", this.onRetQuestList, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestdetail", this.onRetQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestgroup", this.onRetQuestGroup, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICATASK_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestList, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);

        this.game.emitter.off(ModuleName.PICATASK_NAME + "_retquestlist", this.onRetQuestList, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_retquestdetail", this.onRetQuestDetail, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_retquestgroup", this.onRetQuestGroup, this);
    }

    private onHideView() {
        this.hide();
    }

    private onQueryQuestList() {
        this.mModel.queryQuestList();
    }

    private onQueryQuestDetail(id: string) {
        this.mModel.queryQuestDetail(id);
    }

    private onQuerySubmitQuest(id: string) {
        this.mModel.querySubmitQuest(id);
    }
    private onRetQuestList(quests: op_client.PKT_Quest[]) {
        this.mView.setTaskDatas(quests);
    }

    private onRetQuestDetail(quest: op_client.PKT_Quest) {
        this.mView.setTaskDetail(quest);
    }
    private onRetQuestGroup(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP) {

    }
}
