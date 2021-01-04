import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";
import { PicaRecaste } from "./PicaRecaste";

export class PicaRecasteMediator extends BasicMediator {
    protected mModel: PicaRecaste;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICARECASTE_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaRecaste(game, this.mScneType);
        this.addLisenter();
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_retrecasteresult", this.onRetRescateHandler, this);
        this.game.emitter.on(this.key + "_retrecastelistresult", this.onRetRescateListHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryrecaste", this.queryRecaste, this);
        this.game.emitter.on(this.key + "_queryrecastelist", this.queryFuriListByStar, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_retrecasteresult", this.onRetRescateHandler, this);
        this.game.emitter.off(this.key + "_retrecastelistresult", this.onRetRescateListHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryrecaste", this.queryRecaste, this);
        this.game.emitter.off(this.key + "_queryrecastelist", this.queryFuriListByStar, this);
        super.hide();
    }

    destroy() {
        super.destroy();
        this.removeLisenter();
    }

    get bag() {
        const bag = this.userData;
        if (!bag) {
            return;
        }
        return this.userData.playerBag;
    }

    get userData() {
        if (!this.game.user || !this.game.user.userData) {
            return;
        }
        return this.game.user.userData;
    }

    protected panelInit() {
        if (this.panelInit) {
            if (this.mView) {
                this.onUpdatePlayerInfoHandler();
                this.setCategories(op_pkt_def.PKT_PackageType.FurniturePackage);
            }
        }
    }

    private onCloseHandler() {
        this.hide();
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
        if (this.mView) {
            const value = this.userData.playerProperty.picaStar ? this.userData.playerProperty.picaStar.value : 0;
            this.mView.setStarData(value);
        }
    }

    private onRetRescateHandler(reward: op_client.ICountablePackageItem) {
        if (this.mView) {
            this.mView.setComposeResult(reward);
            const uimgr = this.game.uiManager;
            uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: [reward], type: "open" });
        }
    }
    private onRetRescateListHandler(list: op_client.ICountablePackageItem[]) {
        this.cacheMgr.setRecasteList(list);
        if (this.mView) this.mView.queryRecasteList();
    }

    private queryRecaste(id: string) {
        this.mModel.queryRecaste(id);
    }

    private queryFuriListByStar(data: { type: string, star: number }) {
        const tempArr = this.cacheMgr.getRecasteList(data.type, data.star);
        if (tempArr && tempArr.length > 0) {
            this.mView.setProp(tempArr);
        } else {
            this.mModel.queryRecasteList();
        }

    }
    private setCategories(categoryType: number) {
        if (this.mView) {
            const data = this.cacheMgr.getBagCategory(categoryType);
            this.mView.setCategories(data.subcategory);
        }
    }

    private get cacheMgr() {
        const mgr = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        return mgr;
    }
}
