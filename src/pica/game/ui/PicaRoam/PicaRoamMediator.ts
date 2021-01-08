import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName } from "structure";
import { PicaRoam } from "./PicaRoam";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
export class PicaRoamMediator extends BasicMediator {
    protected mModel: PicaRoam;
    protected curMoneyData: any;
    constructor(game: Game) {
        super(ModuleName.PICAROAM_NAME, game);
        this.mModel = new PicaRoam(game);
        this.addLisenter();
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_queryroamlist", this.query_ROAM_LIST, this);
        this.game.emitter.on(this.key + "_queryroamdraw", this.query_ROAM_DRAW, this);
        this.game.emitter.on(this.key + "_queryprogressrewards", this.query_PROGRESS_REWARD, this);
        this.game.emitter.on(this.key + "_retquestlist", this.onRetRoamListResult, this);
        this.game.emitter.on(this.key + "_retquestdraw", this.onRetRoamDrawResult, this);
        this.game.emitter.on(this.key + "_updatetoken", this.updateTokenData, this);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_queryroamlist", this.query_ROAM_LIST, this);
        this.game.emitter.off(this.key + "_queryroamdraw", this.query_ROAM_DRAW, this);
        this.game.emitter.off(this.key + "_queryprogressrewards", this.query_PROGRESS_REWARD, this);
        this.game.emitter.off(this.key + "_retquestlist", this.onRetRoamListResult, this);
        this.game.emitter.off(this.key + "_retquestdraw", this.onRetRoamDrawResult, this);
        this.game.emitter.off(this.key + "_updatetoken", this.updateTokenData, this);
        this.game.emitter.off(this.key + "_hide", this.hide, this);
        super.hide();
    }

    panelInit() {
        super.panelInit();
        this.query_ROAM_LIST();
    }
    destroy() {
        super.destroy();
        this.removeLisenter();
    }
    private addLisenter() {
        if (!this.userData) return;
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    private removeLisenter() {
        if (!this.userData) return;
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    private onUpdatePlayerInfoHandler() {
        if (this.curMoneyData) {
            this.updateTokenData(this.curMoneyData);
        }
    }

    private query_ROAM_LIST() {
        this.mModel.query_ROAM_LIST();
    }

    private query_ROAM_DRAW(id: string) {
        this.mModel.query_ROAM_DRAW(id);
    }

    private query_PROGRESS_REWARD(index: number) {
        this.mModel.query_PROGRESS_REWARD("draw_SETTING0160001_CP0000002", index);
    }

    private onRetRoamListResult(pools: op_client.IDRAW_POOL_STATUS[]) {
        this.updateServiceTime(pools);
        if (this.mView) this.mView.setRoamDataList(pools);
    }

    private onRetRoamDrawResult(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_RESULT) {
        this.updateServiceTime([content.poolUpdate]);
        if (this.mView) this.mView.setRoamDrawResult(content.poolUpdate);
        this.onRetDrawHandler(content.rewards);
    }

    private updateTokenData(data: { tokenId: string, alterId: string }) {
        this.curMoneyData = data;
        if (this.userData && this.userData.playerProperty) {
            const property = this.userData.playerProperty;
            const money = property.getProperty(data.tokenId);
            const alter = property.getProperty(data.alterId);
            const altervalue = alter ? alter.value : 0;
            if (this.mView) this.mView.setRoamTokenData(money.value, altervalue, data.tokenId);
        }
    }
    private onRetDrawHandler(reward: op_client.ICountablePackageItem[]) {
        const uimgr = this.game.uiManager;
        const tag = reward.length === 1 ? "open" : "roamdraw";
        uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: reward, type: tag });
    }

    private updateServiceTime(pools: op_client.IDRAW_POOL_STATUS[]) {
        const unixTime = this.game.clock.unixTime;
        for (const data of pools) {
            data["unixTime"] = unixTime;
        }
    }
    get userData() {
        if (!this.game.user || !this.game.user.userData) {
            return;
        }
        return this.game.user.userData;
    }
}
