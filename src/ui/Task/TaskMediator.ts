import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { Task } from "./Task";
import { TaskPanel } from "./TaskPanel";
import { BaseMediator } from "apowophaserui";

export class TaskMediator extends BaseMediator {
    protected mView: TaskPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private task: Task;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new TaskPanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
            this.mView.on("questlist", this.onQueryQuestList, this);
            this.mView.on("questdetail", this.onQueryQuestDetail, this);
            this.mView.on("submitquest", this.onQuerySubmitQuest, this);
        }
        if (!this.task) {
            this.task = new Task(this.world);
            this.task.register();
            this.task.on("questlist", this.onRetQuestList, this);
            this.task.on("questdetail", this.onRetQuestDetail, this);
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
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
        this.destroy();
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
