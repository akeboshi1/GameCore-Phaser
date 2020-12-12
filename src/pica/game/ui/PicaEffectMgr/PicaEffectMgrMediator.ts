
import { BaseDataManager, BasicMediator, DataMgrType, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { PicaEffectMgr } from "./PicaEffectMgr";

export class PicaEffectMgrMediator extends BasicMediator {
    private picagift: PicaEffectMgr;
    private tempDataQueue: any[] = [];
    constructor(game: Game) {
        super(ModuleName.PICAEFFECTMGR_NAME, game);
        this.picagift = new PicaEffectMgr(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAEFFECTMGR_NAME + "_hide", this.onCloseHandler, this);
        this.game.emitter.on(EventType.ELEMENT_ITEM_CONFIG, this.onItemDataHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAEFFECTMGR_NAME + "_hide", this.onCloseHandler, this);
        this.game.emitter.off(EventType.ELEMENT_ITEM_CONFIG, this.onItemDataHandler, this);
    }

    destroy() {
        if (this.picagift) {
            this.picagift.destroy();
            this.picagift = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        this.hide();
    }

    private onItemDataHandler(temp: any) {
        if (temp.status === 0) {
            const data = temp.data;
        }
    }

}
