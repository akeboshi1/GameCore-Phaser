import { Dialog } from "./Dialog";
import { op_client } from "pixelpai_proto";
import { BasicMediator } from "../basic/basic.mediator";
import { Game } from "src/game/game";
import { ModuleName } from "structure";
export class DialogMediator extends BasicMediator {
    public static NAME: string = ModuleName.DIALOG_NAME;
    private dialog: Dialog;
    constructor(protected game: Game) {
        super(game);
        this.dialog = new Dialog(this.game);
    }

    show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        super.show(param);
        this.__exportProperty(() => {
            this.game.peer.render.showPanel(DialogMediator.NAME, param);
        });
    }
    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
        super.update(param);
    }

    public onQueryNextDialog(uiid: number, comid: number, data?: number[]) {
        this.dialog.queryNextDialog(uiid, comid, data);
    }

    destroy() {
        if (this.dialog) {
            this.dialog.destroy();
            this.dialog = undefined;
        }
    }

    hide() {
        super.hide();
        this.destroy();
    }
}
