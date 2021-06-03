import { PKT_Quest, QUERY_QUEST_GROUP } from "custom_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { MainUIRedType, RedEventType } from "picaStructure";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { ObjectAssign } from "utils";
import { BaseDataConfigManager } from "../../config";
import { PicaGame } from "../../pica.game";
import { PicaMail } from "./PicaTask";
export class PicaTaskMediator extends BasicMediator {
    protected mModel: PicaMail;
    protected taskGroup: any;
    constructor(game: Game) {
        super(ModuleName.PICATASK_NAME, game);
        this.mModel = new PicaMail(game);
    }

    show(param?: any) {
        param = param || this.cacheMgr.taskOption;
        super.show(param);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questlist", this.onQueryQuestGroup, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_questdetail", this.onQueryQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_submitquest", this.onQuerySubmitQuest, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_queryreward", this.onQueryQuestReward, this);

        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestlist", this.onRetQuestList, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestdetail", this.onRetQuestDetail, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_retquestgroup", this.onRetQuestGroup, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_querygo", this.onGoHandler, this);
        this.game.emitter.on(ModuleName.PICATASK_NAME + "_queryaccele", this.queryAcceleTask, this);
        this.game.emitter.on(RedEventType.TASK_PANEL_RED, this.onRedSystemHandler, this);
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
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_querygo", this.onGoHandler, this);
        this.game.emitter.off(ModuleName.PICATASK_NAME + "_queryaccele", this.queryAcceleTask, this);
        this.game.emitter.off(RedEventType.TASK_PANEL_RED, this.onRedSystemHandler, this);
    }

    onEnable() {
        this.proto.on("QUERY_QUEST_GROUP", this.onRetQuestGroup, this);
    }
    onDisable() {
        this.proto.off("QUERY_QUEST_GROUP", this.onRetQuestGroup, this);
    }

    panelInit() {
        super.panelInit();
        this.mView.setMoneyData(this.game.user.userData.diamond);
        if (this.taskGroup) {
            this.onRetQuestGroup(this.taskGroup);
            this.taskGroup = undefined;
        }
        this.onRedSystemHandler((<PicaGame>this.game).getRedPoints(MainUIRedType.TASK));
    }
    private onHideView() {
        this.hide();
    }

    private queryAcceleTask(id: number) {
        this.game.sendCustomProto("STRING", "questFacade:clockUpDailyQuest", { id });
    }
    private onQueryQuestDetail(id: string) {
        this.mModel.queryQuestDetail(id);
    }
    private onQueryQuestGroup(type: number) {
        if (type === op_pkt_def.PKT_Quest_Type.QUEST_MAIN_MISSION) this.cacheMgr.taskOption = 1;
        else if (type === op_pkt_def.PKT_Quest_Type.QUEST_DAILY_GOAL) this.cacheMgr.taskOption = 2;
        this.mModel.queryQuestGroup(type);
    }
    private onQueryQuestReward(type: number) {
        this.mModel.queryGroupRewards(type);
    }
    private onQuerySubmitQuest(id: string) {
        this.mModel.querySubmitQuest(id);
    }
    private onRetQuestList(quests: PKT_Quest[]) {
        if (this.mView) this.mView.setTaskDatas(quests);
    }

    private onRetQuestDetail(quest: PKT_Quest) {
        if (this.mView) this.mView.setTaskDetail(quest);
    }
    private onRetQuestGroup(packet: any) {
        const content: QUERY_QUEST_GROUP = packet.content;
        if (content.id) {
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const tempgroup = configMgr.getQuestGroupMap(content.id);
            ObjectAssign.excludeAssign(content, tempgroup);
            if (content.quests) {
                for (const quest of content.quests) {
                    configMgr.getBatchItemDatas(quest.targets);
                    configMgr.getBatchItemDatas(quest.rewards);
                    const temp = configMgr.getQuest(quest.id);
                    ObjectAssign.excludeAllAssign(quest, temp);
                    quest.display = { texturePath: "pkth5/npc/task_head_npc_1" };
                    configMgr.synItemBase(quest.itemToCost);
                    quest["acceletips"] = configMgr.getI18n("PKT_SYS0000040");
                    quest["servertime"] = this.game.clock.unixTime;
                }
            }
        }
        if (this.mView) this.mView.setTaskDatas(content);
        else this.taskGroup = content;
    }

    private onGoHandler(data: string) {
        if (data) {
            const datas = data.split("-");
            this.hide();
            this.game.uiManager.showMed(datas[0], datas[1]);
        }
    }
    private onRedSystemHandler(reds: number[]) {
        if (this.mView) this.mView.setRedsState(reds);
    }

    private get cacheMgr() {
        return this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
    }
}
