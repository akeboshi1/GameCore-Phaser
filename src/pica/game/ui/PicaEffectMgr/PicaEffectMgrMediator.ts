
import { BaseDataManager, BasicMediator, DataMgrType, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { PicaEffectMgr } from "./PicaEffectMgr";

export class PicaEffectMgrMediator extends BasicMediator {
    protected mModel: PicaEffectMgr;
    protected tempQueue: any[] = [];
    constructor(game: Game) {
        super(ModuleName.PICAEFFECTMGR_NAME, game);
        this.mModel = new PicaEffectMgr(this.game);
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

    panelInit() {
        super.panelInit();
        for (const temp of this.tempQueue) {
            this.mView.play([{ line1: temp.line1, line2: temp.line2 }], "unlock");
        }
    }
    setParam(param) {
        super.setParam(param);
        if (!param) return;
        if (!this.mPanelInit) {
            this.tempQueue.push(param);
        } else {
            this.mView.play([{ line1: param.line1, line2: param.line2 }], "unlock");
        }
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
