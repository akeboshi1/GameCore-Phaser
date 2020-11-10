import { Dialog } from "./Dialog";
import { op_client } from "pixelpai_proto";
import { Game } from "src/game/game";
import { ModuleName } from "structure";
import { BasicMediator } from "gamecore";
export class DialogMediator extends BasicMediator {
    private dialog: Dialog;
    constructor(protected game: Game) {
        super(ModuleName.DIALOG_NAME, game);
        this.dialog = new Dialog(this.game);
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
