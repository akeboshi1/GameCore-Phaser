import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { PicaMainUIPanel } from "./PicaMainUIPanel";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicaMainUI } from "./PicaMainUI";
import { Logger } from "../../utils/log";

export class PicaMainUIMediator extends BaseMediator {
    public static NAME: string = "PicaMainUIMediator";
    private world: WorldService;
    private mainUI: PicaMainUI;
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.world = worldService;
        this.mainUI = new PicaMainUI(worldService);
        this.mainUI.on("update", this.onUpdateHandler, this);
    }

    show(param?: any) {
        if (this.mView && this.mView.isShow() || this.mShow) {
            this.update(param);
            return;
        }
        if (!this.mView) {
            this.mView = new PicaMainUIPanel(this.scene, this.world);
        }
        this.mView.show(param);
        this.mView.on("enterEdit", this.onEnterEditSceneHandler, this);
        this.layerManager.addToUILayer(this.mView.view);
    }

    private onEnterEditSceneHandler() {
        if (this.mainUI) {
            this.mainUI.sendEnterDecorate();
        }
    }

    private onUpdateHandler(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        this.show(content);
    }
}
