import { BasicMediator, Game } from "gamecore";
import { op_client } from "pixelpai_proto";
import { ModuleName, RENDER_PEER } from "structure";
import { PicaMineSettle } from "./PicaMineSettle";

export class PicaMineSettleMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAMINESETTLE_NAME, game);
        this.mModel = new PicaMineSettle(this.game);
        this.game.emitter.on("minesettlepacket", this.onMineSettlePacket, this);
    }

    show(param?: any) {
        super.show(param);

        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.onHideMineSettle, this);
    }

    panelInit() {
        super.panelInit();

        if (this.mShowData && this.mShowData.length > 0)
            this.setMIneSettlePanel(this.mShowData[0]);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_hide", this.onHideMineSettle, this);

        super.hide();
    }

    destroy() {
        this.game.emitter.off("minesettlepacket", this.onMineSettlePacket, this);
        super.destroy();
    }

    private onHideMineSettle() {
        this.model.reqMineSettlePacket();
        this.hide();
    }

    private onMineSettlePacket(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE) {
        if (!this.mView || !this.mView.visible) {
            this.setParam([content]);
            this.show();
        } else {
            this.setMIneSettlePanel(content);
        }
    }

    private setMIneSettlePanel(content) {
        this.mView.setData("settleData", content);
        this.mView.setMineSettlePacket(content);
    }

    private get model(): PicaMineSettle {
        return (<PicaMineSettle>this.mModel);
    }
}
