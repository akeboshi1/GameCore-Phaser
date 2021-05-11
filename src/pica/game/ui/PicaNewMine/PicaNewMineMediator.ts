import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { PicaNewMine } from "./PicaNewMine";
import { BasicMediator, Game, UIType } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { Logger } from "utils";
import { ISocial } from "../../../structure";
export class PicaNewMineMediator extends BasicMediator {
    protected mModel: PicaNewMine;
    private uid: string;
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

    destroy() {
        super.destroy();
    }
    panelInit() {
        super.panelInit();
        this.uid = this.mShowData;
    }

    private onUsePropHandler(roleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.PICAPLAYERINFO_NAME, this.mShowData);
    }

    private onHideView() {
        this.hide();
    }
    private onViewInitComplete() {
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
