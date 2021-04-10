import { op_client } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicaEquipUpgrade } from "./PicaEquipUpgrade";

export class PicaEquipUpgradeMediator extends BasicMediator {
    protected mModel: PicaEquipUpgrade;
    constructor(game: Game) {
        super(ModuleName.PICAEQUIPUPGRADE_NAME, game);
        this.mModel = new PicaEquipUpgrade(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_reqActive", this.onReqActiveEquipment, this);
        this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_reqEquiped", this.onReqEquipedEquipment, this);
        this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_retactiveEquip", this.onActiveEquipment, this);
       // this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_retshowopen", this.onShowEquipPanel, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_reqActive", this.onReqActiveEquipment, this);
        this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_reqEquiped", this.onReqEquipedEquipment, this);
        this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_retactiveEquip", this.onActiveEquipment, this);
       // this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_retshowopen", this.onShowEquipPanel, this);
    }

    destroy() {
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        if (this.mParam && this.mParam.length > 0)
            this.onEquipUpgradePacket(this.mParam[0]);
    }

    private onHidePanel() {
        this.hide();
    }

    private onEquipUpgradePacket(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL) {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAEQUIPUPGRADE_NAME];
        this.mView.setData("upgradeData", content);
        this.mView.setEquipDatas(content);
    }

    private onActiveEquipment(data: op_client.IMiningEquipment) {
        if (this.mView) this.mView.setActiveEquipment(data);
    }

    private onReqEquipedEquipment(id: string) {
        if (this.mModel) this.mModel.reqEquipedEquipment(id);
    }

    private onReqActiveEquipment(id: string) {
        if (this.mModel) this.mModel.reqActiveEquipment(id);
    }

    private onShowEquipPanel(content: any) {
        this.setParam([content]);
        this.show();
    }

}
