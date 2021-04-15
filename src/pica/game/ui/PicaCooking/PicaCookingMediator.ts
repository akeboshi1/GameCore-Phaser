import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { PicaCooking } from "./PicaCooking";
import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";
import { ISocial } from "picaStructure";
export class PicaCookingMediator extends BasicMediator {
    protected mModel: PicaCooking;
    private uid: string;
    constructor(game: Game) {
        super(ModuleName.PICACOOKING_NAME, game);
        this.mModel = new PicaCooking(game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_categorytype", this.onCookingMaterialsHandler, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.on(ModuleName.PICANEWROLE_NAME + "_cookingids", this.onCookingIDsHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_categorytype", this.onCookingMaterialsHandler, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.off(ModuleName.PICANEWROLE_NAME + "_cookingids", this.onCookingIDsHandler, this);
    }

    destroy() {
        super.destroy();
    }
    panelInit() {
        super.panelInit();
        this.setCookingCategory();
    }

    private setCookingCategory() {
        if (this.mView) {
            const datas = [{ type: "CATEGORY_1", name: "肉类" }, { type: "CATEGORY_2", name: "海鲜" }, { type: "CATEGORY_3", name: "蔬菜" }, { type: "CATEGORY_4", name: "蛋奶" }]
            this.mView.setCategoryDatas(datas);
        }
    }

    private onCookingMaterialsHandler(category: string) {
        const datas = ["IA0000011", "IA0000012", "IA0000013", "IA0000014", "IA0000015", "IA0000016", "IA0000017"];
        const temps = [];
        for (const id of datas) {
            const item = this.config.getItemBaseByID(id);
            item.count = 10;
            temps.push(item);
        }
        this.mView.setCookingDatas(datas);
    }
    private onCookingIDsHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {

    }

    private onHideView() {
        this.hide();
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.BOTTOM);
    }
    private onViewInitComplete() {
        const uimanager = this.game.uiManager;
        uimanager.hideMed(ModuleName.BOTTOM);
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
