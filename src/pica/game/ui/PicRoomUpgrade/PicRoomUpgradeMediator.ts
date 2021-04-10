import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicRoomUpgrade } from "./PicRoomUpgrade";

export class PicRoomUpgradeMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAROOMUPGRADE_NAME, game);
        this.mModel = new PicRoomUpgrade(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAROOMUPGRADE_NAME + "_querytargetui", this.onQueryTargetUI, this);
    }

    hide() {
        this.game.emitter.off(ModuleName.PICAROOMUPGRADE_NAME + "_querytargetui", this.onQueryTargetUI, this);
        super.hide();
    }

    private onQueryTargetUI(uid: number) {
        (<PicRoomUpgrade>this.mModel).queryTargetUI(uid);
        this.game.showLoading();
        this.hide();
    }
}
