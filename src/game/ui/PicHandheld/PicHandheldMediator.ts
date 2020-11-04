import { op_client } from "pixelpai_proto";
import { PicHandheld } from "./PicHandheld";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { BasicMediator } from "../basic/basic.mediator";
import { Game } from "src/game/game";

export class PicHandheldMediator extends BasicMediator {
    public static NAME: string = "PicHandheld";
    private picHand: PicHandheld;
    private picHandheld: PicHandheld;
    constructor(game: Game) {
        super(game);
        this.picHandheld = new PicHandheld(this.game);
        this.picHand.on("handheldlist", this.onHandheldList, this);
    }

    show() {

    }

    hide() {
        super.hide();
        this.game.peer.render.hide();
    }

    destroy() {
        if (this.picHand) {
            this.picHand.destroy();
            this.picHand = undefined;
        }
        super.destroy();
    }

    public requestHandheldList() {
        this.picHand.queryHandheldList();
    }

    private onHandheldList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD) {
        this.mView.setEqipedDatas(content);
    }
    private onChangeHandheld(id: string) {
        this.picHand.queryChangeHandheld(id);
    }

    private onClearHandheld() {
        this.picHand.queryClearHandheld();
    }
    private openEquipedPanel(state: boolean) {
        const uiManager = this.world.uiManager;
        const mediator = uiManager.getMediator(PicaChatMediator.name);
        if (mediator) {
            if (state)
                mediator.hide();
            else {
                mediator.show();
                this.layerManager.removeToUILayer(this.mView);
                this.layerManager.addToUILayer(this.mView);
            }
        }
    }

}
