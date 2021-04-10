import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { PicaElevator } from "./PicaElevator";
export class PicaElevatorMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAELEVATOR_NAME, game);
        this.mModel = new PicaElevator(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + this.key + "_queryui", this.onTargetUIHandler, this);
        this.game.emitter.on(RENDER_PEER + this.key + "_hide", this.hide, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + this.key + "_queryui", this.onTargetUIHandler, this);
        this.game.emitter.off(RENDER_PEER + this.key + "_hide", this.hide, this);
        super.hide();
    }

    isSceneUI() {
        return true;
    }

    private onTargetUIHandler(data: { uiId, componentId }) {
        if (!this.game) {
            return;
        }
        this.model.query_TARGET_UI(data.uiId, data.componentId);
    }

    private get model(): PicaElevator {
        return <PicaElevator>this.mModel;
    }
}
