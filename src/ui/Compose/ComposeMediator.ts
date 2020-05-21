import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { ComposePanel } from "./ComposePanel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Compose } from "./Compose";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

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
    }

    show() {
        if (this.mView) {
            return;
        }
        if (!this.mView) {
            this.mView = new ComposePanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
            this.mView.on("reqformula", this.onReqFormulaDetial, this);
            this.mView.on("reqUseFormula", this.onReqUseFormula, this);
        }
        if (!this.compose) {
            this.compose = new Compose(this.world);
            this.compose.on("formulaDetial", this.onRetFormulaDetial, this);
            this.compose.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        if (this.mParam && this.mParam.length > 0)
            this.onComposePacket(this.mParam[0]);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.compose) {
            this.compose.destroy();
            this.compose = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }
    private onComposePacket(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_SKILLS) {
        const panel = this.mView as ComposePanel;
        if (!panel) return;
        panel.setData("composeData", content);
        panel.setComposeData(content.skills);
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
        this.destroy();
    }

    private getTestData() {
        for (let i = 0; i < 20; i++) {
            const skill = new op_pkt_def.PKT_Skill();
            skill.id = "123123" + i;
            skill.name = "蓝图" + i;
            skill.quality = "A";
            skill.active = (i % 6 === 0 ? false : true);
            skill.qualified = (i % 8 === 0 ? false : true);   
        }
    }

}
