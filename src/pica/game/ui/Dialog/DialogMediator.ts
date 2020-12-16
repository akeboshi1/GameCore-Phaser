import { Dialog } from "./Dialog";
import { Game } from "src/game/game";
import { ModuleName } from "structure";
import { BasicMediator } from "gamecore";
export class DialogMediator extends BasicMediator {
    constructor(protected game: Game) {
        super(ModuleName.DIALOG_NAME, game);
        this.mModel = new Dialog(game);
    }

    public onQueryNextDialog(data: any) {
        const uiid = data.id;
        const comid = data.nodeid;
        const tempdata = undefined;
        this.model.queryNextDialog(uiid, comid, tempdata);
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

    update(param?: any) {
        super.update(param);
        if (this.mView) this.mView.update(param);
    }

    private onHideHandler() {
        this.hide();
    }

    private get model(): Dialog {
        return <Dialog>this.mModel;
    }
}
