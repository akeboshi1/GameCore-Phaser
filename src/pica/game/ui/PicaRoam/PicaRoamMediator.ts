import { BasicMediator, Game } from "gamecore";
import { EventType, ModuleName } from "structure";
import { PicaRoam } from "./PicaRoam";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { BaseDataConfigManager } from "picaWorker";
import { ObjectAssign } from "utils";
export class PicaRoamMediator extends BasicMediator {
    protected mModel: PicaRoam;
    protected curMoneyData: any;
    protected poolsData: op_client.IDRAW_POOL_STATUS[] = [];
    private drawResult: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_RESULT;
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
        this.game.emitter.on(this.key + "_queryrareeffect", this.query_RARE_Effect, this);
        this.game.emitter.on(this.key + "_retquestlist", this.onRetRoamListResult, this);
        this.game.emitter.on(this.key + "_retquestdraw", this.onRetRoamDrawResult, this);
        this.game.emitter.on(this.key + "_updatetoken", this.updateTokenData, this);
        this.game.emitter.on(this.key + "_updatepools", this.updatePoolsData, this);
        this.game.emitter.on(this.key + "_retprogresslist", this.onRetDrawProgress, this);
        this.game.emitter.on(this.key + "_hideeffectone", this.onTreasureHideHandler, this);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_queryroamlist", this.query_ROAM_LIST, this);
        this.game.emitter.off(this.key + "_queryroamdraw", this.query_ROAM_DRAW, this);
        this.game.emitter.off(this.key + "_queryprogressrewards", this.query_PROGRESS_REWARD, this);
        this.game.emitter.off(this.key + "_queryrareeffect", this.query_RARE_Effect, this);
        this.game.emitter.off(this.key + "_retquestlist", this.onRetRoamListResult, this);
        this.game.emitter.off(this.key + "_retquestdraw", this.onRetRoamDrawResult, this);
        this.game.emitter.off(this.key + "_updatetoken", this.updateTokenData, this);
        this.game.emitter.off(this.key + "_updatepools", this.updatePoolsData, this);
        this.game.emitter.off(this.key + "_retprogresslist", this.onRetDrawProgress, this);
        this.game.emitter.off(this.key + "_hideeffectone", this.onTreasureHideHandler, this);
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
        this.mModel.query_PROGRESS_REWARD("draw_SETTING0160001_CP0000002", index - 1);
    }

    private query_RARE_Effect() {
        this.onRetDrawHandler(this.drawResult.rewards);
    }

    private onRetRoamListResult(pools: op_client.IDRAW_POOL_STATUS[]) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        const basepools = configMgr.getCardPools();
        pools.sort((a, b) => {
            const aindex = basepools.indexOf(configMgr.getCardPool(a.id));
            const bindex = basepools.indexOf(configMgr.getCardPool(b.id));
            if (aindex > bindex) return 1;
            else return -1;
        });
        // for (const pool of pools) {
        for (let i = 0; i < pools.length; i++) {
            const pool = pools[i];
            const basePool = configMgr.getCardPool(pool.id);
            ObjectAssign.excludeTagAssign(pool, basePool);
            for (const reward of pool.progressAward) {
                configMgr.getBatchItemDatas(reward.rewards);
            }
            let found = false;
            for (let m = 0; m < this.poolsData.length; m++) {
                if (this.poolsData[m].id === pool.id) {
                    this.poolsData[m] = pool;
                    found = true;
                }
            }
            if (!found) {
                this.poolsData.splice(i, 0, pool);
            }
        }
        this.updateServiceTime(pools);
        if (this.mView) this.mView.setRoamDataList(pools);
    }

    private onRetRoamDrawResult(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_DRAW_RESULT) {
        this.drawResult = content;
        for (const data of this.poolsData) {
            if (data.id === content.poolUpdate.id) {
                Object.assign(data, content.poolUpdate);
            }
        }
        this.updateServiceTime(this.poolsData);
        if (this.mView) {
            this.mView.setRoamDataList(this.poolsData);
            const configMgr = <BaseDataConfigManager>this.game.configManager;
            configMgr.getBatchItemDatas(content.rewards);
            this.mView.openRoamEffectOnePanel(content.rewards);
        }
        // this.onRetDrawHandler(content.rewards);
    }

    private updatePoolsData() {
        if (this.poolsData) this.onRetRoamListResult(this.poolsData);
    }

    private updateTokenData(data: { tokenId: string, alterId: string }) {
        this.curMoneyData = data;
        if (this.userData && this.userData.playerProperty) {
            const property = this.userData.playerProperty;
            const money = property.getProperty(data.tokenId);
            const alter = this.userData.playerBag.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.alterId);// property.getProperty(data.alterId);
            const altervalue = alter;// alter ? alter.value : 0;
            if (this.mView) this.mView.setRoamTokenData(money.value, altervalue, data.tokenId);
        }
    }
    private onRetDrawHandler(reward: op_client.ICountablePackageItem[]) {
        const uimgr = this.game.uiManager;
        const tag = reward.length === 1 ? "open" : "roamdraw";
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(reward);
        uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: reward, type: tag, event: this.key + "_hideeffectone" });
    }

    private onRetDrawProgress(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        const tokenId = this.curMoneyData.tokenId;
        let tempData;
        for (const data of this.poolsData) {
            if (data.tokenId === tokenId && data.drawTime !== 1) {
                data.progressAward = content.steps;
                data.progress = content.currentProgressValue;
                tempData = data;
            }
        }
        if (tempData) {
            this.updateServiceTime([tempData]);
            if (this.mView) this.mView.setRoamDrawResult(tempData);
            this.onRetDrawHandler(tempData);
        }

    }
    private onTreasureHideHandler() {
        if (this.mView) this.mView.hideRoamEffectOnePanel();
    }
    private updateServiceTime(pools: op_client.IDRAW_POOL_STATUS[]) {

        const unixTime = this.game.clock.unixTime;
        for (const data of pools) {
            data["unixTime"] = unixTime;
            if (data.nextFreeTime !== undefined) {
                if (data.nextFreeTime * 1000 < unixTime) {
                    data["free"] = true;
                } else {
                    data["free"] = false;
                }
            } else {
                data["free"] = false;
            }
            if (data.tokenId === "IV0000002") {
                data["diamond"] = true;
                data["free"] = false;
            } else {
                data["diamond"] = false;
            }

        }
    }
    get userData() {
        if (!this.game.user || !this.game.user.userData) {
            return;
        }
        return this.game.user.userData;
    }
}
