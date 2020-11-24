import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { PicaTreasure } from "./PicaTreasure";

export class PicaTreasureMediator extends BasicMediator {

    constructor(game: Game) {
        super(ModuleName.PICATREASURE, game);
        this.mModel = new PicaTreasure(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onHidePanel, this);
    }
    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onHidePanel, this);
    }
    destroy() {
        super.destroy();
    }
    private onHidePanel() {
        super.destroy();
    }
}
