import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { PicaRoomUpgrade } from "./PicaRoomUpgrade";

export class PicaRoomUpgradeMediator extends BasicMediator {
    private picaRoom: PicaRoomUpgrade;
    constructor(game: Game) {
        super(ModuleName.PICAROOMUPGRADE_NAME, game);
        this.picaRoom = new PicaRoomUpgrade(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAROOMUPGRADE_NAME + "_querytargetui", this.onQueryTargetUI, this);
        this.game.emitter.on("querytargetui", this.onQueryTargetUI, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAROOMUPGRADE_NAME + "_querytargetui", this.onQueryTargetUI, this);
        this.game.emitter.off("querytargetui", this.onQueryTargetUI, this);
    }

    destroy() {
        if (this.picaRoom) {
            this.picaRoom.destroy();
            this.picaRoom = undefined;
        }
        super.destroy();
    }

    private onQueryTargetUI(uid: number) {
        this.picaRoom.queryTargetUI(uid);
        this.game.showLoading();
        this.destroy();
    }
}
