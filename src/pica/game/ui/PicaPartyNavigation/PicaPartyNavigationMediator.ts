import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { PicaPartyNavigation } from "./PicaPartyNavigation";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "picaWorker";
import { IScene } from "picaStructure";
export class PicaPartyNavigationMediator extends BasicMediator {
    private mPartyListData: any;
    private mPlayerProgress: any;
    constructor(game: Game) {
        super(ModuleName.PICAPARTYNAVIGATION_NAME, game);

        if (!this.mModel) {
            this.mModel = new PicaPartyNavigation(game);
            this.game.emitter.on(this.key + "_questlist", this.on_PARTY_LIST, this);
            this.game.emitter.on(this.key + "_progresslist", this.on_PLAYER_PROGRESS, this);
            this.game.emitter.on(this.key + "_myRoomList", this.onMyRoomListHandler, this);
            this.game.emitter.on(this.key + "_roomList", this.onRoomListHandler, this);
            this.game.emitter.on(this.key + "_enterRoomResult", this.onEnterRoomResultHandler, this);
            this.game.emitter.on(this.key + "_newroomlist", this.onNewRoomListHandler, this);
            this.game.emitter.on(this.key + "_newselfroomlist", this.onNewSelfRoomListHandler, this);
        }
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_querylist", this.query_PARTY_LIST, this);
        this.game.emitter.on(this.key + "_queryenter", this.queryEnterRoom, this);
        this.game.emitter.on(this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.on(this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.on(this.key + "_getRoomList", this.query_GET_ROOM_LIST, this);
        this.game.emitter.on(this.key + "_getMyRoomList", this.query_SELF_ROOM_LIST, this);
        this.game.emitter.on(this.key + "_getnavigatelist", this.setNavigationData, this);

    }

    hide() {
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_querylist", this.query_PARTY_LIST, this);
        this.game.emitter.off(this.key + "_queryenter", this.queryEnterRoom, this);
        this.game.emitter.off(this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.off(this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.off(this.key + "_getRoomList", this.query_GET_ROOM_LIST, this);
        this.game.emitter.off(this.key + "_getMyRoomList", this.query_SELF_ROOM_LIST, this);
        this.game.emitter.off(this.key + "_getnavigatelist", this.setNavigationData, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off(this.key + "_questlist", this.on_PARTY_LIST, this);
        this.game.emitter.off(this.key + "_progresslist", this.on_PLAYER_PROGRESS, this);
        this.game.emitter.off(this.key + "_myRoomList", this.onMyRoomListHandler, this);
        this.game.emitter.off(this.key + "_roomList", this.onRoomListHandler, this);
        this.game.emitter.off(this.key + "_enterRoomResult", this.onEnterRoomResultHandler, this);
        this.game.emitter.off(this.key + "_newroomlist", this.onNewRoomListHandler, this);
        this.game.emitter.off(this.key + "_newselfroomlist", this.onNewSelfRoomListHandler, this);
        super.destroy();
    }

    isSceneUI() {
        return false;
    }

    protected panelInit() {
        super.panelInit();
        // if (this.mPartyListData) {
        //     this.mView.setPartyListData(this.mPartyListData, this.game.user.userData.isSelfRoom);
        // }
        this.setNavigationData();
        if (this.mPlayerProgress) {
            this.mView.setOnlineProgress(this.mPlayerProgress);
        }
    }

    private onCloseHandler() {
        this.hide();
    }
    private on_PARTY_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST) {
        if (!this.mPanelInit) {
            this.mPartyListData = content;
            return;
        }
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
        if (!this.mPanelInit) {
            return;
        }
        for (const step of content.steps) {
            this.config.getBatchItemDatas(step.rewards);
        }
        this.mPlayerProgress = content;
        this.mView.setOnlineProgress(content);
    }

    private query_GET_ROOM_LIST(data: { page: number, perPage: number }) {
        // this.model.query_GET_ROOM_LIST(1, 30);
        this.model.query_ROOM_LIST(op_def.RoomTypeEnum.NORMAL_ROOM, data.page, data.perPage);
    }
    private query_SELF_ROOM_LIST(roomType: number) {
        const arr = [op_def.RoomTypeEnum.NORMAL_ROOM, op_def.RoomTypeEnum.SHOP];
        for (const type of arr) {
            this.model.query_SELF_ROOM_LIST(type);
        }
    }
    private query_ROOM_HISTORY() {
        this.model.query_ROOM_HISTORY();
    }

    private onRoomListHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST) {

    }

    private onMyRoomListHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY) {
        this.mView.setRoomListData(content);
    }

    private onEnterRoomResultHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM) {

    }
    private onNewRoomListHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST) {
        this.mView.setRoomListData(content);
    }

    private onNewSelfRoomListHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST) {
        this.mView.setSelfRoomListData(content);
    }

    private setNavigationData() {
        if (!this.mPanelInit) return;
        const map = <Map<string, IScene[]>>this.config.getScenes();
        const arr = [];
        map.forEach((value, key) => {
            if (key !== "undefined") {
                const obj = { type: key, name: this.config.getI18n(key), datas: value };
                arr.push(obj);
            }
        });
        this.mView.setNavigationListData(arr);
    }
    private get model(): PicaPartyNavigation {
        return (<PicaPartyNavigation>this.mModel);
    }
    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
