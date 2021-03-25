import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../config";
import { PicaTreasure } from "./PicaTreasure";

export class PicaTreasureMediator extends BasicMediator {

    private complEvent: string;
    constructor(game: Game) {
        super(ModuleName.PICATREASURE_NAME, game);
        this.mModel = new PicaTreasure(game);
    }

    show(param?: any) {
        this.onUpdateItemBase(param);
        super.show(param);
        this.game.emitter.on(this.key + "_close", this.onHidePanel, this);
        this.complEvent = param.event;
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
        if (this.complEvent) this.game.emitter.emit(this.complEvent);
        this.complEvent = undefined;
    }

    private onUpdateItemBase(param) {
        if (param && param.data) {
            const config = <BaseDataConfigManager>this.game.configManager;
            for (const item of param.data) {
                config.synItemBase(item);
            }
        }
    }
}
