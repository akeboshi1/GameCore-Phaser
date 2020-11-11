import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";

export class PicPropFunMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICPROPFUN_NAME, game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
    }

    private onCloseHandler() {
        this.hide();
    }
}
