import { BasicMediator, Game } from "gamecore";
import { BaseDataConfigManager } from "../../config";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { AvatarSuitType, EventType, ModuleName } from "structure";
import { PicaCompose } from "./PicaCompose";
export class PicaComposeMediator extends BasicMediator {
    protected mModel: PicaCompose;
    constructor(game: Game) {
        super(ModuleName.PICACOMPOSE_NAME, game);
        if (!this.mModel) {
            this.mModel = new PicaCompose(this.game);
        }
    }

    show(param?: any) {
        this.updateSkills(param.skills);
        super.show(param);
        this.game.emitter.on("formulaDetial", this.onRetFormulaDetial, this);
        this.game.emitter.on(ModuleName.PICACOMPOSE_NAME + "_showpanel", this.onShowPanel, this);
        this.game.emitter.on(ModuleName.PICACOMPOSE_NAME + "_hide", this.onHideView, this);
        // this.game.emitter.on(ModuleName.PICACOMPOSE_NAME + "_reqformula", this.onReqFormulaDetial, this);
        this.game.emitter.on(ModuleName.PICACOMPOSE_NAME + "_reqUseFormula", this.onReqUseFormula, this);
        this.game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.on(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off("formulaDetial", this.onRetFormulaDetial, this);
        this.game.emitter.off(ModuleName.PICACOMPOSE_NAME + "_showpanel", this.onShowPanel, this);
        this.game.emitter.off(ModuleName.PICACOMPOSE_NAME + "_hide", this.onHideView, this);
        // this.game.emitter.off(ModuleName.PICACOMPOSE_NAME + "_reqformula", this.onReqFormulaDetial, this);
        this.game.emitter.off(ModuleName.PICACOMPOSE_NAME + "_reqUseFormula", this.onReqUseFormula, this);
        this.game.emitter.off(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.off(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
    }

    private onSyncFinishHandler() {
        if (this.mView) {
            const skills = this.mShowData.skills;
            this.updateSkills(skills);
            this.mView.setComposeData(skills);
        }
    }

    private onUpdateHandler() {
        if (this.mView) {
            const skills = this.mShowData.skills;
            this.updateSkills(skills);
            this.mView.setComposeData(skills);
        }
    }
    get playerBag() {
        if (this.userData) {
            return this.userData.playerBag;
        }
        return null;
    }
    // private onReqFormulaDetial(id: string) {
    //     this.mModel.onReqFormulaDetail(id);
    // }
    private onReqUseFormula(id: string) {
        this.mModel.onReqUseFormula(id);
    }
    private onRetFormulaDetial(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(content.materials);
        this.mView.setComposeDetialData(content);
    }

    private onShowPanel(data: { panel: string, data?: any }) {
        const uimanager = this.game.uiManager;
        uimanager.showMed(data.panel, data.data);
    }
    private onHideView() {
        this.hide();
    }
    private updateSkills(skills: op_client.IPKT_CRAFT_SKILL[]) {
        if (this.playerBag) {
            for (const item of skills) {
                item.skill.qualified = this.isQualified(item);
            }
        }
    }

    private isQualified(item: op_client.IPKT_CRAFT_SKILL) {
        if (this.playerBag) {
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            const curAvatar = Object.assign({}, this.game.roomManager.currentRoom.playerManager.actor.model.avatar);
            if (item.product) {
                configMgr.getBatchItemDatas([item.product]);
                const product = item.product;
                item.productDes = product.des;
                item.productName = product.name;
                item.productSource = product.source;
                item.productAnimations = product.animations;
                item.productDisplay = product.animationDisplay;
                if (item.product.suitType) {
                    const dataAvatar: any = AvatarSuitType.createAvatarBySn(product.suitType, product.sn, product.slot, product.tag, product.version, curAvatar);
                    // const dataAvatar: any = AvatarSuitType.createHasBaseAvatarBySn(product.suitType, product.sn, product.slot, product.tag, product.version);
                    item.productAvatar = dataAvatar;
                }
            }
            let qualified = true;
            const materials = item.materials;
            if (materials) {
                configMgr.getBatchItemDatas(materials);
                for (const data of materials) {
                    const count = this.playerBag.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.id, data.subcategory);
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

    get userData() {
        const user = this.game.user;
        if (!user || !user.userData) {
            return;
        }
        return user.userData;
    }
}
