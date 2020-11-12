import { Dialog } from "./Dialog";
import { Game } from "src/game/game";
import { ModuleName } from "structure";
import { BasicMediator } from "gamecore";
export class DialogMediator extends BasicMediator {
    private dialog: Dialog;
    constructor(protected game: Game) {
        super(ModuleName.DIALOG_NAME, game);
        this.dialog = new Dialog(game);
    }

    public onQueryNextDialog(uiid: number, comid: number, data?: number[]) {
        this.dialog.queryNextDialog(uiid, comid, data);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.DIALOG_NAME + "_querydialog", this.onQueryNextDialog, this);
        this.game.emitter.on(ModuleName.DIALOG_NAME + "_hide", this.onHideHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.DIALOG_NAME + "_querydialog", this.onQueryNextDialog, this);
        this.game.emitter.off(ModuleName.DIALOG_NAME + "_hide", this.onHideHandler, this);
    }

    destroy() {
        if (this.dialog) {
            this.dialog.destroy();
            this.dialog = undefined;
        }
        super.destroy();
    }

    private onHideHandler() {
        this.hide();
    }
}
