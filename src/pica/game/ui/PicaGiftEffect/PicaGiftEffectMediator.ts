
import { BaseDataManager, BasicMediator, DataMgrType, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { PicaGiftEffect } from "./PicaGiftEffect";

export class PicaGiftEffectMediator extends BasicMediator {
    private picagift: PicaGiftEffect;
    private tempDataQueue: any[];
    constructor(game: Game) {
        super(ModuleName.PICAGIFTEFFECT_NAME, game);
        this.picagift = new PicaGiftEffect(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAGIFTEFFECT_NAME + "_hide", this.onCloseHandler, this);
        this.game.emitter.on(EventType.ELEMENT_ITEM_CONFIG, this.onItemDataHandler, this);
        this.updateGiftData(param);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAGIFTEFFECT_NAME + "_hide", this.onCloseHandler, this);
        this.game.emitter.off(EventType.ELEMENT_ITEM_CONFIG, this.onItemDataHandler, this);
    }

    destroy() {
        if (this.picagift) {
            this.picagift.destroy();
            this.picagift = undefined;
        }
        super.destroy();
    }

    private updateGiftData(param: any) {
        if (param && param.length > 0) {
            const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT = param[0];
            this.tempDataQueue.push(data);
            const mgr = this.game.getDataMgr<BaseDataManager>(DataMgrType.BaseMgr);
            if (mgr) {
                mgr.query_ELEMENT_ITEM_REQUIREMENTS(data.itemId, "QueryItems");
            }
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
