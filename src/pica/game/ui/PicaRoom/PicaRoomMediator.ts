import { BasicMediator, Game } from "gamecore";
import { BaseDataConfigManager } from "../../config";
import { op_client } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { PicaRoom } from "./PicaRoom";

export class PicaRoomMediator extends BasicMediator {
    protected mModel: PicaRoom;
    constructor(game: Game) {
        super(ModuleName.PICAROOM_NAME, game);
        this.mModel = new PicaRoom(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_hide", this.hide, this);
        this.game.emitter.on(this.key + "_queryrequirements", this.query_REFURBISH_REQUIREMENTS, this);
        this.game.emitter.on(this.key + "_queryrefurbish", this.query_ROOM_REFURBISH, this);
        this.game.emitter.on(this.key + "_name", this.query_EditorRoomName, this);
        this.game.emitter.on(this.key + "_openparty", this.query_Open_Party, this);

        this.game.emitter.on(EventType.UPDATE_ROOM_INFO, this.onRoomInfoHandler, this);
        this.game.emitter.on(this.key + "_refurbish", this.on_REFURBISH_REQUIREMENTS, this);
        this.game.emitter.on(this.key + "_themelist", this.on_PARTY_INFO, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_hide", this.hide, this);
        this.game.emitter.off(this.key + "_queryrequirements", this.query_REFURBISH_REQUIREMENTS, this);
        this.game.emitter.off(this.key + "_queryrefurbish", this.query_ROOM_REFURBISH, this);
        this.game.emitter.off(this.key + "_name", this.query_EditorRoomName, this);
        this.game.emitter.on(this.key + "_openparty", this.query_Open_Party, this);

        this.game.emitter.off(EventType.UPDATE_ROOM_INFO, this.onRoomInfoHandler, this);
        this.game.emitter.off(this.key + "_refurbish", this.on_REFURBISH_REQUIREMENTS, this);
        this.game.emitter.off(this.key + "_themelist", this.on_PARTY_INFO, this);
        super.hide();
    }

    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
            this.mModel = undefined;
        }
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        this.queryRoomInfoHandler();
        this.query_PartyData();
    }

    private onRoomInfoHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        const isSelfRoom = this.game.user.userData.isSelfRoom;
        this.mView.setRoomInfoData(content);
    }

    private queryRoomInfoHandler() {
        const curRoomID = this.game.user.userData.curRoomID;
        if (curRoomID) {
            this.mModel.queryRoomInfo(curRoomID);
        }
    }

    private query_REFURBISH_REQUIREMENTS(roomid) {
        this.mModel.query_REFURBISH_REQUIREMENTS(roomid);
    }
    private query_ROOM_REFURBISH(roomid) {
        this.mModel.query_ROOM_REFURBISH(roomid);
    }
    private query_PartyData() {
        const curRoomID = this.game.user.userData.curRoomID;
        if (curRoomID) this.mModel.query_PARTY_REQUIREMENTS(curRoomID);
    }

    private query_Open_Party() {
        //  this.picaRoom.query_CREATE_PARTY();
        // tslint:disable-next-line: no-console
        console.error("query_Open_Party");
    }

    private query_EditorRoomName(name: string) {
        const curRoomID = this.game.user.userData.curRoomID;
        this.mModel.query_UPDATE_EDITOR_ROOM(curRoomID, name);
    }

    private on_REFURBISH_REQUIREMENTS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(content.requirements);
        this.mView.on_REFURBISH_REQUIREMENTS(content);
    }

    private on_PARTY_INFO(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS) {
        this.mView.setPartyInfo(content);
    }
}
