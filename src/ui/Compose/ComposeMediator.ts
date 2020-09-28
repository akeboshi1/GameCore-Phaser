import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { ComposePanel } from "./ComposePanel";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Compose } from "./Compose";
import { BaseMediator } from "apowophaserui";
export class ComposeMediator extends BaseMediator {
    protected mView: ComposePanel;
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
        this.addLisenter();

    }

    destroy() {
        if (this.compose) this.compose.destroy();
        this.compose = undefined;
        super.destroy();
        this.removeLisenter();
    }

    private addLisenter() {
        if (!this.world.user || !this.world.user.bag) return;
        const mgr = this.world.user.bag;
        if (mgr) {
            mgr.on("syncfinish", this.onSyncFinishHandler, this);
            mgr.on("update", this.onUpdateHandler, this);
        }
    }

    private removeLisenter() {
        if (!this.world.user || !this.world.user.bag) return;
        const mgr = this.world.user.bag;
        if (mgr) {
            mgr.off("syncfinish", this.onSyncFinishHandler, this);
            mgr.off("update", this.onUpdateHandler, this);
        }
    }

    private onSyncFinishHandler() {
        if (this.mView) {
            const skills = this.mParam[0].skills;
            this.updateSkills(skills);
            this.mView.setComposeData(skills);
        }
    }

    private onUpdateHandler() {
        if (this.mView) {
            const skills = this.mParam[0].skills;
            this.updateSkills(skills);
            this.mView.setComposeData(skills);
        }
    }
    get playerData() {
        if (this.bag) {
            return this.bag.playerBag;
        }
        return null;
    }
    private onReqFormulaDetial(id: string) {
        this.compose.onReqFormulaDetail(id);
    }
    private onReqUseFormula(id: string) {
        this.compose.onReqUseFormula(id);
    }
    private onRetFormulaDetial(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA) {
        this.mView.setComposeDetialData(content);
    }

    private onHideView() {
        super.destroy();
    }

    private onShowPanel(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_SKILLS) {
        const skills = content.skills;
        this.updateSkills(skills);
        this.setParam([content]);
        this.show();
    }

    private updateSkills(skills: op_client.IPKT_CRAFT_SKILL[]) {
        if (this.playerData) {
            for (const item of skills) {
                item.skill.qualified = this.isQualified(item);
            }
        }
    }

    private isQualified(item: op_client.IPKT_CRAFT_SKILL) {
        if (this.playerData) {
            let qualified = true;
            const materials = item.materials;
            if (materials) {
                for (const data of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.id, data.subcategory);
                    data.count = count;
                    if (count < data.neededCount) {
                        qualified = false;
                    }
                }
            }
            return qualified;
        }
        return false;
    }

    get bag() {
        const user = this.world.user;
        if (!user || !user.bag) {
            return;
        }
        return user.bag;
    }
}
