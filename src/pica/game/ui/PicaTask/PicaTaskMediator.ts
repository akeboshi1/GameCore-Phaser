import { BasicMediator, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../data";
import { PicaTask } from "./PicaTask";
export class PicaTaskMediator extends BasicMediator {
    protected mModel: PicaTask;
    protected taskGroup: any;
    constructor(game: Game) {
        super(ModuleName.PICATASK_NAME, game);
        this.mModel = new PicaTask(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestGroup, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_queryreward", this.onQueryQuestReward, this);

        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestlist", this.onRetQuestList, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestdetail", this.onRetQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestgroup", this.onRetQuestGroup, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICATASK_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestGroup, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_queryreward", this.onQueryQuestReward, this);

        this.game.emitter.off(ModuleName.PICATASK_NAME + "_retquestlist", this.onRetQuestList, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_retquestdetail", this.onRetQuestDetail, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_retquestgroup", this.onRetQuestGroup, this);
    }
    panelInit() {
        super.panelInit();
        if (this.taskGroup) {
            this.onRetQuestGroup(this.taskGroup);
            this.taskGroup = undefined;
        }
    }
    private onHideView() {
        this.hide();
    }

    // private onQueryQuestList() {
    //     this.mModel.queryQuestList();
    // }
    private onQueryQuestDetail(id: string) {
        this.mModel.queryQuestDetail(id);
    }
    private onQueryQuestGroup(type: number) {
        this.mModel.queryQuestGroup(type);
    }
    private onQueryQuestReward(type: number) {
        this.mModel.queryGroupRewards(type);
    }
    private onQuerySubmitQuest(id: string) {
        this.mModel.querySubmitQuest(id);
    }
    private onRetQuestList(quests: op_client.PKT_Quest[]) {
        if (this.mView) this.mView.setTaskDatas(quests);
    }

    private onRetQuestDetail(quest: op_client.PKT_Quest) {
        if (this.mView) this.mView.setTaskDetail(quest);
    }
    private onRetQuestGroup(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.synItemBase(content.reward);
        if (content.quests) {
            for (const quest of content.quests) {
                configMgr.getBatchItemDatas(quest.targets);
                configMgr.getBatchItemDatas(quest.rewards);
            }
        }
        if (this.mView) this.mView.setTaskDatas(content);
        else this.taskGroup = content;
    }
}
