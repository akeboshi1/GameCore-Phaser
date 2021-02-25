
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
            this.setViewEffect(temp);
        }
    }
    setParam(param) {
        super.setParam(param);
        if (!param) return;
        if (!this.mPanelInit) {
            this.tempQueue.push(param);
        } else {
            this.setViewEffect(param);
        }
    }

    private setViewEffect(data: any) {
        const arr = [];
        if (data.effecttype === "unlock") {
            arr.push({ line1: data.line1, line2: data.line2 });
        } else if (data.effecttype === "levelup") {
            data.level = this.game.user.userData.level;
            arr.push(data);
        }
        this.mView.play(arr, data.effecttype);
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
