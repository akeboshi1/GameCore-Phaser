import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { PicaTreasure } from "./PicaTreasure";

export class PicaTreasureMediator extends BasicMediator {

    constructor(game: Game) {
        super(ModuleName.PICATREASURE_NAME, game);
        this.mModel = new PicaTreasure(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_close", this.onHidePanel, this);
    }
    hide() {
        super.hide();
        this.game.emitter.off(this.key + "_close", this.onHidePanel, this);
    }

    // panelInit() {
    //     super.panelInit();
    //     if (this.mView) this.mView.setTreasureData(this.mShowData);
    // }

    private onHidePanel() {
        this.hide();
    }
}
