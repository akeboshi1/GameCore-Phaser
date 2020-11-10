import { PicHandheld } from "./PicHandheld";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { EventType, MAIN_WORKER, ModuleName } from "structure";
import { BasicMediator, Game } from "gamecore";
import { op_client } from "pixelpai_proto";

export class PicHandheldMediator extends BasicMediator {
    public static NAME: string = ModuleName.PICHANDHELD_NAME;
    private picHandheld: PicHandheld;
    constructor(game: Game) {
        super(game);
        this.picHandheld = new PicHandheld(this.game);
        this.game.emitter.on(MAIN_WORKER + "_handheldlist", this.onHandheldList, this);
    }

    show(param?: any) {
        super.show(param);
        this.mShowData = param;
        if (!this.mPanelInit) {
            this.__exportProperty(() => {
                this.game.peer.render.showPanel(PicHandheldMediator.NAME, param);
                if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICHANDHELD_NAME];
                this.game.emitter.on(EventType.PANEL_INIT, this.onPanelInitCallBack, this);
                this.game.emitter.on("changehandheld", this.onChangeHandheld, this);
                this.game.emitter.on("clearhandheld", this.onClearHandheld, this);
                this.game.emitter.on("handheldlist", this.onReqHandheldList, this);
                this.game.emitter.on("openeqiped", this.openEquipedPanel, this);
            });
        } else {
            if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICHANDHELD_NAME];
            if (this.mView && this.mShowData) {
                this.mView.setEqipedDatas(this.mShowData);
            }
        }
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICACHAT_NAME];
        if (this.mView) {
            this.mView.hide();
        }
        this.mView = undefined;
        super.hide();
        this.game.emitter.off("changehandheld", this.onChangeHandheld, this);
        this.game.emitter.off("clearhandheld", this.onClearHandheld, this);
        this.game.emitter.off("handheldlist", this.onReqHandheldList, this);
        this.game.emitter.off("openeqiped", this.openEquipedPanel, this);
    }

    destroy() {
        if (this.picHandheld) {
            this.picHandheld.destroy();
            this.picHandheld = undefined;
        }
        this.hide();
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    protected onPanelInitCallBack() {
        super.onPanelInitCallBack();
        this.show();
    }

    private onReqHandheldList() {
        this.picHandheld.queryHandheldList();
    }

    private onHandheldList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD) {
        this.mShowData = content;
        if (!this.mPanelInit) return;
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICHANDHELD_NAME];
        if (this.mView && this.mShowData) {
            this.mView.setEqipedDatas(this.mShowData);
        }
    }

    private onChangeHandheld(id: string) {
        this.picHandheld.queryChangeHandheld(id);
    }

    private onClearHandheld() {
        this.picHandheld.queryClearHandheld();
    }
    private openEquipedPanel(state: boolean) {
        const uiManager = this.game.uiManager;
        const mediator = uiManager.getMed(PicaChatMediator.NAME);
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
