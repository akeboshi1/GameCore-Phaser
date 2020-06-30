import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { ComposePanel } from "./ComposePanel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Compose } from "./Compose";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { Logger } from "../../utils/log";
import { SoundField } from "../../../lib/rexui/lib/ui/interface/sound/ISoundConfig";

export class ComposeMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private compose: Compose;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
        if (!this.compose) {
            this.compose = new Compose(this.world);
            this.compose.on("formulaDetial", this.onRetFormulaDetial, this);
            this.compose.on("showopen", this.onShowPanel, this);
            this.compose.register();
            Logger.getInstance().log("qwerqwerqwerqwerrrr+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        }
    }

    show() {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        if (!this.mView) {
            this.mView = new ComposePanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
            this.mView.on("reqformula", this.onReqFormulaDetial, this);
            this.mView.on("reqUseFormula", this.onReqUseFormula, this);
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show(this.mParam[0]);

    }

    destroy() {
        if (this.compose) this.compose.destroy();
        this.compose = undefined;
        super.destroy();
    }

    private onReqFormulaDetial(id: string) {
        this.compose.onReqFormulaDetail(id);
    }
    private onReqUseFormula(id: string) {
        this.compose.onReqUseFormula(id);
    }
    private onRetFormulaDetial(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA) {
        const panel = (this.mView as ComposePanel);
        panel.setComposeDetialData(content);
    }

    private onHideView() {
        super.destroy();
    }

    private onShowPanel(content: any) {
        this.setParam([content]);
        this.show();
    }
}
