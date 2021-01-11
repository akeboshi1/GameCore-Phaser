import { op_client } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicaExploreLog } from "./PicaExploreLog";

export class PicaExploreLogMediator extends BasicMediator {
    protected mModel: PicaExploreLog;
    constructor(game: Game) {
        super(ModuleName.PICAEXPLORELOG_NAME, game);
        this.mModel = new PicaExploreLog(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.on(ModuleName.PICAEQUIPUPGRADE_NAME + "_retexplorelist", this.onEXPLORE_REQUIRE_LIST, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.off(ModuleName.PICAEQUIPUPGRADE_NAME + "_retexplorelist", this.onEXPLORE_REQUIRE_LIST, this);
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

    private onEXPLORE_REQUIRE_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_REQUIRE_LIST) {

    }
}
