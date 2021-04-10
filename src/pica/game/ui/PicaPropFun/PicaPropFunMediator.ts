import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";

export class PicaPropFunMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAPROPFUN_NAME, game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
        super.hide();
    }

    private onCloseHandler() {
        this.hide();
    }
}
