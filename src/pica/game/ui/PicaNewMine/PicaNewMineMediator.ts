import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { PicaNewMine } from "./PicaNewMine";
import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";
import { ISocial } from "../../../structure";
import { IMineShowPackage } from "src/pica/structure/imine.show.package";
export class PicaNewMineMediator extends BasicMediator {
    protected mModel: PicaNewMine;
    private subType: string;
    constructor(game: Game) {
        super(ModuleName.PICANEWMINE_NAME, game);
        this.mModel = new PicaNewMine(game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
        this.game.emitter.on(this.key + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.on(this.key + "_useprop", this.onUsePropHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(this.key + "_hide", this.hide, this);
        this.game.emitter.off(this.key + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.off(this.key + "_useprop", this.onUsePropHandler, this);
    }
    onEnable() {
        this.proto.on("MINE_SHOW_PACKAGE", this.onMineShowPackageHandler, this);
    }
    onDisable() {
        this.proto.off("MINE_SHOW_PACKAGE", this.onMineShowPackageHandler, this);
    }
    panelInit() {
        super.panelInit();
        this.queryMineData();
    }

    private queryMineData() {
        this.game.sendCustomProto("STRING", "minerData:openMinePackage", {});
    }
    private onUsePropHandler(id: string) {
        this.game.sendCustomProto("STRING", "minerData:useMineItems", { id });
    }
    private onMineShowPackageHandler(packt: any) {
        const content: IMineShowPackage = packt.content;
        if (this.mView) this.mView.setMineData(content);
        if (!this.subType) {
            this.setMineProps(content.subcategory);
            this.subType = content.subcategory;
        }
    }
    private setMineProps(subType: string) {
        const playerBag = this.game.user.userData.playerBag;
        const datas = playerBag.getItemsByCategory(op_pkt_def.PKT_PackageType.PropPackage, subType);
        if (this.mView) this.mView.setPropDatas(datas);
    }
    private onViewInitComplete() {
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
