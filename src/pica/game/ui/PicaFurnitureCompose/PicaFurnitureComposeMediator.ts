import { PicaFurnitureCompose } from "./PicaFurnitureCompose";
import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";

export class PicaFurnitureComposeMediator extends BasicMediator {
    protected mModel: PicaFurnitureCompose;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICAFURNITURECOMPOSE_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaFurnitureCompose(game, this.mScneType);
        this.addLisenter();
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_retcomposeresult", this.onRetComposeHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryfuricompose", this.queryFuriCompose, this);
        this.game.emitter.on(this.key + "_queryfuripackage", this.queryFuriPackageByStar, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_retcomposeresult", this.onRetComposeHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryfuricompose", this.queryFuriCompose, this);
        this.game.emitter.off(this.key + "_queryfuripackage", this.queryFuriPackageByStar, this);
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

    protected _show() {
    }

    protected panelInit() {
        if (this.panelInit) {
            if (this.mView) {
                this.mView.setCategories();
                this.onUpdatePlayerInfoHandler();
            }
        }
    }

    protected mediatorExport() {
    }

    private onCloseHandler() {
        this.hide();
    }

    private addLisenter() {
        if (!this.userData) return;
        this.game.emitter.on(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.on(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    private removeLisenter() {
        if (!this.userData) return;
        this.game.emitter.off(EventType.PACKAGE_SYNC_FINISH, this.onSyncFinishHandler, this);
        this.game.emitter.off(EventType.PACKAGE_UPDATE, this.onUpdateHandler, this);
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfoHandler, this);
    }

    private onSyncFinishHandler() {
        if (this.mView) this.mView.queryRefreshPackage();
    }

    private onUpdateHandler() {
        if (this.mView) this.mView.queryRefreshPackage(true);
    }
    private onUpdatePlayerInfoHandler() {
        if (this.mView) {
            const value = this.userData.playerProperty.picaStar ? this.userData.playerProperty.picaStar.value : 0;
            this.mView.setStarData(value);
        }
    }

    private onRetComposeHandler(reward: op_client.ICountablePackageItem) {
        if (this.mView) {
            this.mView.setComposeResult(reward);
            const uimgr = this.game.uiManager;
            uimgr.showMed(ModuleName.PICATREASURE_NAME, { data: [reward], type: "open" });
        }
    }

    private queryFuriCompose(ids: string[]) {
        this.mModel.queryFuriCompose(ids);
    }

    private queryFuriPackageByStar(obj: { type: number, update: boolean }) {
        const furibag = this.bag.furniBag;
        const list = furibag.list;
        const tempArr = [];
        for (const data of list) {
            if (data.grade === obj.type && data.rarity === 1) {
                tempArr.push(data);
            }
        }
        if (!obj.update) {
            this.mView.setGridProp(tempArr);
        } else {
            this.mView.updateGridProp(tempArr);
        }
    }
}
