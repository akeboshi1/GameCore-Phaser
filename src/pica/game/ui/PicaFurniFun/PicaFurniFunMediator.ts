import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaFurniFun } from "./PicaFurniFun";
import { ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";

export class PicaFurniFunMediator extends BasicMediator {
    private picFurni: PicaFurniFun;
    constructor(game: Game) {
        super(ModuleName.PICAFURNIFUN_NAME, game);
        this.picFurni = new PicaFurniFun(this.game);
        this.picFurni.register();
       // this.game.emitter.on("showpicafunipanel", this.onOpenView, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_queryunlock", this.queryUnlockElement, this);
        this.game.emitter.on(ModuleName.PICAFURNIFUN_NAME + "_close", this.onCloseHandler, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAFURNIFUN_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_queryunlock", this.queryUnlockElement, this);
        this.game.emitter.off(ModuleName.PICAFURNIFUN_NAME + "_close", this.onCloseHandler, this);
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

    private onCloseHandler() {
        super.destroy();
    }

    private onOpenView(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_UNLOCK_ELEMENT_REQUIREMENT) {
        if (content.materials) this.updateMaterials(content.materials);
        this.setParam(content);
        this.show();
    }
    private queryUnlockElement(ids: number[]) {
        this.picFurni.queryUnlockElement(ids);
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
}
