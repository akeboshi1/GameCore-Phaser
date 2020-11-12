import { BasicMediator, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName, RENDER_PEER } from "structure";
import { PicaManorList } from "./PicaManorList";

export class PicaManorListMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAMANORLIST_NAME, game);
        this.mModel = new PicaManorList(this.game);
        this.game.emitter.on("streetlist", this.onCOMMERCIAL_STREET, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.onHidePanel, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querylist", this.query_COMMERCIAL_STREET, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryenter", this.queryEnterRoom, this);
    }

    hide() {
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.onHidePanel, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querylist", this.query_COMMERCIAL_STREET, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryenter", this.queryEnterRoom, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off("streetlist", this.onCOMMERCIAL_STREET, this);
        super.destroy();
    }

    private onHidePanel() {
        this.hide();
    }

    private query_COMMERCIAL_STREET(page: number, per_page: number) {
        this.model.query_COMMERCIAL_STREET(page, per_page);
    }
    private queryEnterRoom(roomID: string, password?: string) {
        this.model.queryEnterRoom(roomID);
    }
    private onCOMMERCIAL_STREET(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_STREET_LIST) {
        this.mView.setManorList(content);
    }

    private get model(): PicaManorList {
        return (<PicaManorList>this.mModel);
    }
}
