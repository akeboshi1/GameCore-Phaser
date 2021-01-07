import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicaRoam } from "./PicaRoam";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
export class PicaRoamMediator extends BasicMediator {
    protected mModel: PicaRoam;
    constructor(game: Game) {
        super(ModuleName.PICAROAM_NAME, game);
        this.mModel = new PicaRoam(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_queryroamlist", this.query_ROAM_LIST, this);
        this.game.emitter.on(this.key + "_queryroamdraw", this.query_ROAM_DRAW, this);
        this.game.emitter.on(this.key + "_retquestlist", this.onRetRoamListResult, this);
        this.game.emitter.on(this.key + "_retquestdraw", this.onRetRoamDrawResult, this);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_queryroamlist", this.query_ROAM_LIST, this);
        this.game.emitter.off(this.key + "_queryroamdraw", this.query_ROAM_DRAW, this);
        this.game.emitter.off(this.key + "_retquestlist", this.onRetRoamListResult, this);
        this.game.emitter.off(this.key + "_retquestdraw", this.onRetRoamDrawResult, this);
        this.game.emitter.off(this.key + "_hide", this.hide, this);
        super.hide();
    }

    panelInit() {
        super.panelInit();
        this.query_ROAM_LIST();
    }

    private query_ROAM_LIST() {
        this.mModel.query_ROAM_LIST();
    }

    private query_ROAM_DRAW(id: string) {
        this.mModel.query_ROAM_DRAW(id);
    }

    private onRetRoamListResult(pools: op_client.IDRAW_POOL_STATUS[]) {
        if (this.mView) this.mView.setRoamDataList(pools);
    }

    private onRetRoamDrawResult(poolUpdate: op_client.IDRAW_POOL_STATUS) {

    }
}
