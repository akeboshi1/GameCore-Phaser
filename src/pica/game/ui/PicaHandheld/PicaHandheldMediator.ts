import { PicaHandheld } from "./PicaHandheld";
import { MAIN_WORKER, ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
import { op_client } from "pixelpai_proto";

export class PicaHandheldMediator extends BasicMediator {
    private PicaHandheld: PicaHandheld;
    constructor(game: Game) {
        super(ModuleName.PICAHANDHELD_NAME, game);
        this.PicaHandheld = new PicaHandheld(this.game);
        this.game.emitter.on(MAIN_WORKER + "_handheldlist", this.onHandheldList, this);
    }

    show(param?: any) {
        super.show(param);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICACHAT_NAME];
        super.hide();
        this.game.emitter.off("changehandheld", this.onChangeHandheld, this);
        this.game.emitter.off("clearhandheld", this.onClearHandheld, this);
        this.game.emitter.off("handheldlist", this.onReqHandheldList, this);
        this.game.emitter.off("openeqiped", this.openEquipedPanel, this);
    }

    destroy() {
        if (this.PicaHandheld) {
            this.PicaHandheld.destroy();
            this.PicaHandheld = undefined;
        }
        this.hide();
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    protected panelInit() {
        this.game.emitter.on("changehandheld", this.onChangeHandheld, this);
        this.game.emitter.on("clearhandheld", this.onClearHandheld, this);
        this.game.emitter.on("handheldlist", this.onReqHandheldList, this);
        this.game.emitter.on("openeqiped", this.openEquipedPanel, this);
    }

    private onReqHandheldList() {
        this.PicaHandheld.queryHandheldList();
    }

    private onHandheldList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD) {
        this.mShowData = content;
        if (!this.mPanelInit) return;
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAHANDHELD_NAME];
        if (this.mView && this.mShowData) {
            this.mView.setEqipedDatas(this.mShowData);
        }
    }

    private onChangeHandheld(id: string) {
        this.PicaHandheld.queryChangeHandheld(id);
    }

    private onClearHandheld() {
        this.PicaHandheld.queryClearHandheld();
    }
    private openEquipedPanel(state: boolean) {
        const uiManager = this.game.uiManager;
        const mediator = uiManager.getMed(ModuleName.PICAHANDHELD_NAME);
        if (mediator) {
            if (state) {
                mediator.hide();
            } else {
                mediator.show();
                this.hide();
                this.show(this.mShowData);
            }
        }
    }

}
