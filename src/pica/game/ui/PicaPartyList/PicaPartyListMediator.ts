import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaPartyList } from "./PicaPartyList";
import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
export class PicaPartyListMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAPARTYLIST_NAME, game);

        if (!this.mModel) {
            this.mModel = new PicaPartyList(game);
            this.game.emitter.on("questlist", this.on_PARTY_LIST, this);
            this.game.emitter.on("progresslist", this.on_PLAYER_PROGRESS, this);
        }
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querylist", this.query_PARTY_LIST, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryenter", this.queryEnterRoom, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querylist", this.query_PARTY_LIST, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryenter", this.queryEnterRoom, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off("questlist", this.on_PARTY_LIST, this);
        this.game.emitter.off("progresslist", this.on_PLAYER_PROGRESS, this);
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    private onCloseHandler() {
        this.hide();
    }
    private on_PARTY_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST) {
        this.mView.setPartyListData(content, this.game.user.userData.isSelfRoom);
    }
    private query_PARTY_LIST() {
        this.model.query_PARTY_LIST();
    }
    private queryEnterRoom(roomID: string) {
        this.model.queryEnterRoom(roomID);
    }
    private query_PLAYER_PROGRESS() {
        this.model.query_PLAYER_PROGRESS("online");
    }

    private query_PLAYER_PROGRESS_REWARD(index: number) {
        this.model.query_PLAYER_PROGRESS_REWARD(index);
    }

    private on_PLAYER_PROGRESS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        this.mView.setOnlineProgress(content);
    }

    private get model(): PicaPartyList {
        return (<PicaPartyList>this.mModel);
    }
}
