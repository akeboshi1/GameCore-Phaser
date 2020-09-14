import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicWorkPanel } from "./PicWorkPanel";
import { PicWork } from "./PicWork";
import { PicaMainUIMediator } from "../PicaMainUI/PicaMainUIMediator";
export class PicWorkMediator extends BaseMediator {
    protected mView: PicWorkPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picWork: PicWork;
    private mPlayerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
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
            this.mView = new PicWorkPanel(this.scene, this.world);
            this.mView.on("questlist", this.query_ORDER_LIST, this);
            this.mView.on("questwork", this.query_WORK_ON_JOB, this);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.picWork) {
            this.picWork = new PicWork(this.world);
            this.picWork.on("questlist", this.on_ORDER_LIST, this);
            this.picWork.on("updateplayer", this.onUpdatePlayerInfo, this);
            this.picWork.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picWork) {
            this.picWork.destroy();
            this.picWork = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }
    get playerInfo() {
        if (!this.mPlayerInfo) {
            const med = <PicaMainUIMediator>(this.world.uiManager.getMediator("PicaMainUI"));
            if (med) {
                this.mPlayerInfo = med.playerInfo;
            }
        }
        return this.mPlayerInfo;
    }
    private query_ORDER_LIST() {
        this.picWork.query_JOB_LIST();
    }

    private query_WORK_ON_JOB(id: string) {
        this.picWork.query_WORK_ON_JOB(id);
    }

    private on_ORDER_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST) {
        this.mView.setWorkDataList(content);
        this.onUpdatePlayerInfo(this.playerInfo);
    }
    private onUpdatePlayerInfo(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        if (this.mView)
            this.mView.setProgressData(content.energy, content.workChance);
    }
    private onHideView() {
        this.destroy();
    }
}
