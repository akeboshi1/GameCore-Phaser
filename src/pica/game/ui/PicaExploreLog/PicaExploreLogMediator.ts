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

    protected panelInit() {
        super.panelInit();
        if (this.mShowData) this.onEXPLORE_REQUIRE_LIST(this.mShowData);
    }

    private onHidePanel() {
        this.hide();
    }

    private onEXPLORE_REQUIRE_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_REQUIRE_LIST) {
        this.mShowData = content;
        if (this.mView) this.mView.setExploreDatas(content.list);
    }
}
