import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaFurniFun } from "./PicaFurniFun";
import { EventType, ModuleName } from "structure";
import { BaseDataManager, BasicMediator, DataMgrType, Game, ISprite } from "gamecore";

export class PicaFurniFunMediator extends BasicMediator {
    private picFurni: PicaFurniFun;
    private unlockType: string;
    constructor(game: Game) {
        super(ModuleName.PICAFURNIFUN_NAME, game);
        this.picFurni = new PicaFurniFun(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_queryunlock", this.queryUnlockElement, this);
        this.game.emitter.emit(ModuleName.PICAFURNIFUN_NAME + "_teambuild", this.onTeamBuild, this);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_close", this.onCloseHandler, this);
        this.game.emitter.on(EventType.SEND_FURNITURE_REQUIREMENTS, this.onSyncSNMaterials, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAFURNIFUN_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_queryunlock", this.queryUnlockElement, this);
        this.game.emitter.emit(ModuleName.PICAFURNIFUN_NAME + "_teambuild", this.onTeamBuild, this);
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_close", this.onCloseHandler, this);
        this.game.emitter.off(EventType.SEND_FURNITURE_REQUIREMENTS, this.onSyncSNMaterials, this);
    }

    destroy() {
        if (this.picFurni) {
            this.picFurni.destroy();
        }
        super.destroy();
    }

    get playerData() {
        const user = this.game.user;
        if (!user || !user.userData) {
            return;
        }
        return user.userData.playerBag;
    }

    panelInit() {
        super.panelInit();
        this.querySNMaterial();
    }
    private querySNMaterial() {
        const mgr = this.game.getDataMgr<BaseDataManager>(DataMgrType.BaseMgr);
        mgr.query_FURNITURE_UNFROZEN_REQUIREMENTS([this.mShowData.sn]);
    }
    private onCloseHandler() {
        this.hide();
    }
    private queryUnlockElement(ids: number[]) {
        this.picFurni.queryUnlockElement(ids);
    }

    private onSyncSNMaterials(map: Map<string, op_client.ICountablePackageItem[]>) {
        const data: ISprite = this.mShowData;
        const sn = data.sn;
        if (map.has(sn)) {
            const value: op_client.ICountablePackageItem[] = map.get(sn);
            this.updateMaterials(value);
            if (this.mView) this.mView.setMaterialsData(value);
        }
    }
    private updateMaterials(materials: op_client.ICountablePackageItem[]) {
        if (this.playerData) {
            if (materials) {
                for (const data of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.id, data.subcategory);
                    data.count = count;
                }
            }
        }
    }

    private onTeamBuild(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_TEAMBUILD_ELEMENT_REQUIREMENT) {
        this.setParam(content);
        this.show();
    }
    private query_TEAM_BUILD(ids: number[]) {
        this.picFurni.queryTeamBuild(ids);
    }
}
