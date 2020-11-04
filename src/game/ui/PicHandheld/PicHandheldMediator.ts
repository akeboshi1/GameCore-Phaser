import { op_client } from "pixelpai_proto";
import { PicHandheld } from "./PicHandheld";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { BasicMediator } from "../basic/basic.mediator";
import { Game } from "src/game/game";

export class PicHandheldMediator extends BasicMediator {
    public static NAME: string = "PicHandheld";
    private picHandheld: PicHandheld;
    constructor(game: Game) {
        super(game);
        this.picHandheld = new PicHandheld(this.game);
    }

    show(param?: any) {
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(PicHandheldMediator.NAME, param);
        });
    }

    hide() {
        super.hide();
        this.game.peer.render.hide();
    }

    destroy() {
        if (this.picHandheld) {
            this.picHandheld.destroy();
            this.picHandheld = undefined;
        }
        super.destroy();
    }

    public requestHandheldList() {
        this.picHandheld.queryHandheldList();
    }

    private onChangeHandheld(id: string) {
        this.picHandheld.queryChangeHandheld(id);
    }

    private onClearHandheld() {
        this.picHandheld.queryClearHandheld();
    }
    private openEquipedPanel(state: boolean) {
        const uiManager = this.game.uiManager;
        const mediator = uiManager.getMed(PicaChatMediator.name);
        if (mediator) {
            if (state)
                mediator.hide();
            else {
                mediator.show();
            }
        }
    }

}
