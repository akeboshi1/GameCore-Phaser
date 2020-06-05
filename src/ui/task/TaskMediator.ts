import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { Task } from "./Task";
import { TaskPanel } from "./TaskPanel";

export class TaskMediator extends BaseMediator {
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
        }
        if (!this.task) {
            this.task = new Task(this.world);
            this.task.register();
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
}
