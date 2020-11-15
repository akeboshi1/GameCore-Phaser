import { op_client } from "pixelpai_proto";
import { PicaWork } from "./PicaWork";
import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { EventType, ModuleName } from "structure";
export class PicaWorkMediator extends BasicMediator {
    private picaWork: PicaWork;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICAWORK_NAME, game);
        this.picaWork = new PicaWork(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_questwork", this.query_WORK_ON_JOB, this);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_hide", this.onHideView, this);

        this.game.emitter.on("questlist", this.on_ORDER_LIST, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_questlist", this.query_ORDER_LIST, this);
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_questwork", this.query_WORK_ON_JOB, this);
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_hide", this.onHideView, this);

        this.game.emitter.off("questlist", this.on_ORDER_LIST, this);
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picaWork) {
            this.picaWork.destroy();
            this.picaWork = undefined;
        }
        this.mPlayerInfo = undefined;
        super.destroy();
    }

    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    private query_ORDER_LIST() {
        this.picaWork.query_JOB_LIST();
    }

    private query_WORK_ON_JOB(id: string) {
        this.picaWork.query_WORK_ON_JOB(id);
    }

    private on_ORDER_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST) {
        this.mView.setWorkDataList(content);
        this.onUpdatePlayerInfo(this.playerInfo);
    }
    private onUpdatePlayerInfo(content: PlayerProperty) {
        this.mPlayerInfo = content;
        if (this.mView)
            this.mView.setProgressData(content.energy, content.workChance);
    }
    private onHideView() {
        this.destroy();
    }
}