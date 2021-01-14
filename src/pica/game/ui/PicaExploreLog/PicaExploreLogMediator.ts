import { op_client } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName } from "structure";
import { PicaExploreLog } from "./PicaExploreLog";

export class PicaExploreLogMediator extends BasicMediator {
    protected mModel: PicaExploreLog;
    constructor(game: Game) {
        super(ModuleName.PICAEXPLORELOG_NAME, game);
        this.mModel = new PicaExploreLog(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAEXPLORELOG_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELOG_NAME + "_querygohome", this.onGoHomeHandler, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELOG_NAME + "_queryexplorehint", this.onQueryExploreHint, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELOG_NAME + "_retexplorelist", this.onEXPLORE_REQUIRE_LIST, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELOG_NAME + "_retchapterlist", this.onQUERY_CHAPTER_RESULT, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELOG_NAME + "_retexploresettle", this.onEXPLORE_SUMMARY, this);
        this.game.emitter.on(EventType.CHAT_PANEL_EXTPAND, this.onTipsLayoutHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAEXPLORELOG_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELOG_NAME + "_querygohome", this.onGoHomeHandler, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELOG_NAME + "_queryexplorehint", this.onQueryExploreHint, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELOG_NAME + "_retexplorelist", this.onEXPLORE_REQUIRE_LIST, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELOG_NAME + "_retchapterlist", this.onQUERY_CHAPTER_RESULT, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELOG_NAME + "_retexploresettle", this.onEXPLORE_SUMMARY, this);
        this.game.emitter.off(EventType.CHAT_PANEL_EXTPAND, this.onTipsLayoutHandler, this);
    }

    protected panelInit() {
        super.panelInit();
        if (this.mShowData) this.onEXPLORE_REQUIRE_LIST(this.mShowData);
    }

    private onHidePanel() {
        this.hide();
    }

    private onQueryExploreHint() {
        this.mModel.queryExploreUseHint();
    }
    private onEXPLORE_REQUIRE_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_REQUIRE_LIST) {
        this.mShowData = content;
        if (this.mView) this.mView.setExploreDatas(content.list);
    }
    private onQUERY_CHAPTER_RESULT(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT) {

    }
    private onEXPLORE_SUMMARY(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY) {
        if (this.mView) this.mView.setExploreSettleDatas(content);
    }
    private onGoHomeHandler() {
        this.mModel.queryGOHome();
    }
    private onTipsLayoutHandler(extpand: boolean) {
        if(this.mView)this.mView.setTipsLayout(extpand);
    }
}
