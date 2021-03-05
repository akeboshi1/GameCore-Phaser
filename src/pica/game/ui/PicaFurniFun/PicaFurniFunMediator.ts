import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaFurniFun } from "./PicaFurniFun";
import { EventType, ISprite, ModuleName } from "structure";
import { BaseDataManager, BasicMediator, DataMgrType, Game } from "gamecore";
import { BaseDataConfigManager } from "../../data";
import { ICountablePackageItem } from "picaStructure";
import { ObjectAssign } from "utils";

export class PicaFurniFunMediator extends BasicMediator {
    private picFurni: PicaFurniFun;
    private isTeamBuild: boolean;
    constructor(game: Game) {
        super(ModuleName.PICAFURNIFUN_NAME, game);
        this.picFurni = new PicaFurniFun(this.game);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_teambuild", this.onTeamBuild, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_queryunlock", this.queryUnlockElement, this);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_close", this.onCloseHandler, this);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_queryTeamBuild", this.query_TEAM_BUILD, this);
        this.game.emitter.on(EventType.SEND_FURNITURE_REQUIREMENTS, this.onSyncSNMaterials, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAFURNIFUN_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_queryunlock", this.queryUnlockElement, this);
        // this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_teambuild", this.onTeamBuild, this);
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_close", this.onCloseHandler, this);
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_queryTeamBuild", this.query_TEAM_BUILD, this);
        this.game.emitter.off(EventType.SEND_FURNITURE_REQUIREMENTS, this.onSyncSNMaterials, this);
        this.isTeamBuild = false;
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
        if (!this.isTeamBuild) {
            this.querySNMaterial();
        }
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
            // const configMgr = <BaseDataConfigManager>this.game.configManager;
            // configMgr.getBatchItemDatas(value);
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
        this.isTeamBuild = true;
        const eleMgr = this.game.roomManager.currentRoom.elementManager;
        const ele = eleMgr.get(content.ids[0]);
        if (!ele) return null;

        const list: ICountablePackageItem[] = [];
        if (this.playerData) {
            if (content.materials) {
                // const configMgr = <BaseDataConfigManager>this.game.configManager;
                // configMgr.getBatchItemDatas(content.materials);
                for (const data of content.materials) {
                    const configMgr = <BaseDataConfigManager>this.game.configManager;
                    const temp = configMgr.getItemBase(data.id);
                    ObjectAssign.excludeTagAssign(data, temp);
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.id, data.subcategory);
                    data.recommended = count; // hack
                    list.push(<any>data);
                }
            }
        }
        const model = ele.model;
        const obj = { nickname: model.nickname, displayInfo: model.displayInfo, id: model.id, sn: model.sn };
        this.game.emitter.emit(EventType.SCENE_SHOW_UI, ModuleName.PICAFURNIFUN_NAME, { tag: "teambuild", element: obj, materials: list });
    }
    private query_TEAM_BUILD(ids: number[]) {
        this.picFurni.queryTeamBuild(ids);
    }
}
