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
        this.game.emitter.on(this.key + "_categorytype", this.onCookingMaterialsHandler, this);
        this.game.emitter.on(this.key + "_hide", this.onHideView, this);
        this.game.emitter.on(this.key + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.on(this.key + "_cookingids", this.onCookingIDsHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(this.key + "_categorytype", this.onCookingMaterialsHandler, this);
        this.game.emitter.off(this.key + "_hide", this.onHideView, this);
        this.game.emitter.off(this.key + "_initialized", this.onViewInitComplete, this);
        this.game.emitter.off(this.key + "_cookingids", this.onCookingIDsHandler, this);
    }

    destroy() {
        super.destroy();
    }
    panelInit() {
        super.panelInit();
        this.setCookingCategory();
    }
    protected onEnable() {
        this.proto.on("ANOTHER_PLAYER_INFO", this.onCookingIDsHandler, this);
    }
    protected onDisable() {
        this.proto.off("ANOTHER_PLAYER_INFO", this.onCookingIDsHandler, this);
    }
    private setCookingCategory() {
        if (this.mView) {
            const datas = [{ type: "CATEGORY_1", name: "肉类" }, { type: "CATEGORY_2", name: "海鲜" }, { type: "CATEGORY_3", name: "蔬菜" }, { type: "CATEGORY_4", name: "蛋奶" }];
            this.mView.setCategoryDatas(datas);
        }
    }

    private onCookingMaterialsHandler(category: string) {
        const datas = ["IP1310013", "IP1310016", "IP1310018", "IP1310023", "IP1310033", "IP1310015", "IP1310014"];
        const temps = [];
        for (const id of datas) {
            const item = this.config.getItemBaseByID(id);
            item.count = 10;
            temps.push(item);
        }
        this.mView.setCookingDatas(temps);
    }
    private onCookingIDsHandler(proto: any) {
        const content = proto.content;
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
