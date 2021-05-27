import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { PicaPartyNavigation } from "./PicaPartyNavigation";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "picaWorker";
import { IScene } from "picaStructure";
import { Logger } from "utils";
import { BaseDataType } from "../../config";
import { PicaCommandMsgType } from "../../command/pica.command.msg.type";
export class PicaPartyNavigationMediator extends BasicMediator {
    private mPlayerProgress: any;
    private mPartyListData: any;
    private tempData: any;
    private myRooms: any[];
    private chooseType: number = 1;
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
            //  this.game.emitter.on(this.key + "_newselfroomlist", this.onNewSelfRoomListHandler, this);
        }
    }

    show(param?: any) {
        this.chooseType = Number(param || 1);
        param = this.chooseType;
        super.show(param);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_querylist", this.query_PARTY_LIST, this);
        this.game.emitter.on(this.key + "_queryenter", this.queryEnterRoom, this);
        this.game.emitter.on(this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.on(this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.on(this.key + "_getRoomList", this.query_GET_ROOM_LIST, this);
        this.game.emitter.on(this.key + "_getMyRoomList", this.query_SELF_ROOM_LIST, this);
        this.game.emitter.on(this.key + "_getnavigatelist", this.setNavigationData, this);
        this.game.emitter.on(this.key + "_getRoomTypeList", this.onRoomTypeDatasHandler, this);
        this.game.emitter.on(this.key + "_createroom", this.onCreateRoomHandler, this);
        this.game.emitter.on(PicaCommandMsgType.PicaSelfRoomList, this.onNewSelfRoomListHandler, this);
    }

    hide() {
        this.tempData = undefined;
        this.mPlayerProgress = undefined;
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_querylist", this.query_PARTY_LIST, this);
        this.game.emitter.off(this.key + "_queryenter", this.queryEnterRoom, this);
        this.game.emitter.off(this.key + "_questprogress", this.query_PLAYER_PROGRESS, this);
        this.game.emitter.off(this.key + "_questreward", this.query_PLAYER_PROGRESS_REWARD, this);
        this.game.emitter.off(this.key + "_getRoomList", this.query_GET_ROOM_LIST, this);
        this.game.emitter.off(this.key + "_getMyRoomList", this.query_SELF_ROOM_LIST, this);
        this.game.emitter.off(this.key + "_getnavigatelist", this.setNavigationData, this);
        this.game.emitter.off(this.key + "_getRoomTypeList", this.onRoomTypeDatasHandler, this);
        this.game.emitter.off(this.key + "_createroom", this.onCreateRoomHandler, this);
        this.game.emitter.off(PicaCommandMsgType.PicaSelfRoomList, this.onNewSelfRoomListHandler, this);
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
        if (this.tempData) {
            if (this.chooseType === 2) {
                this.mView.setNavigationListData(this.tempData);
            } else if (this.chooseType === 1) {
                this.onNewRoomListHandler(this.tempData);
            } else if (this.chooseType === 3) {
                for (const temp of this.myRooms) {
                    this.onNewSelfRoomListHandler(temp);
                }
            }
        }
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
        this.model.query_ROOM_LIST(op_def.RoomTypeEnum.NORMAL_ROOM, data.page, data.perPage);
    }
    private query_SELF_ROOM_LIST(roomType: number) {
        const arr = [op_def.RoomTypeEnum.NORMAL_ROOM];// , op_def.RoomTypeEnum.SHOP];
        for (const type of arr) {
            this.model.query_SELF_ROOM_LIST(type);
        }
        if (this.myRooms) {
            this.myRooms.length = 0;
        } else this.myRooms = [];
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
        if (this.tempData)
            this.tempData = content;
        if (!this.mPanelInit) return;
        this.mView.setRoomListData(content);
    }

    private onNewSelfRoomListHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST) {
        let temp = content;
        if (content.roomType === op_def.RoomTypeEnum.NORMAL_ROOM) {
            temp = this.getMyRoomDatas(temp);
        }
        this.myRooms.push(temp);
        if (!this.mPanelInit) return;
        this.mView.setSelfRoomListData(temp);
    }

    private onRoomTypeDatasHandler() {
        const typeData = this.config.getScenes(BaseDataType.roomscene);
        const temps = [];
        for (const temp of typeData) {
            if (temp.unlockType === 1) temps.push(temp);
        }
        this.mView.setRoomTypeDatas(temps);
    }
    private onCreateRoomHandler(id: string) {
        this.game.sendCustomProto("STRING", "roomFacade:createNewRoom", { id });
    }

    private setNavigationData(optionType: number) {
        if (optionType === 1) this.setPicaNavigationData();
        else this.setTooqingNavigationData(optionType);
    }

    private setPicaNavigationData() {
        const map = <Map<string, IScene[]>>this.config.getScenesByCategory(undefined, 0);
        const arr = [];
        map.forEach((value, key) => {
            if (key !== "undefined") {
                const obj = { type: key, name: this.config.getI18n(key), datas: value };
                arr.push(obj);
            }
        });
        this.tempData = arr;
        if (!this.mPanelInit) return;
        this.mView.setNavigationListData(arr);
    }

    private setTooqingNavigationData(optionType: number) {
        const tempArr = this.getMapNavigationData(optionType);
        this.tempData = tempArr;
        if (!this.mPanelInit) return;
        this.mView.setNavigationListData(tempArr);
    }

    private getMapNavigationData(optionType: number) {
        let subTypes: number[], tag: number = -1;
        if (optionType === 4) {
            subTypes = [4];
            tag = 1;
        } else if (optionType === 5) {
            subTypes = [3, 4];
            tag = 1;
        }
        const tempArr = [];
        let tempDatas = [];
        let obj: any;
        for (const type of subTypes) {
            const sceneType = "PKT_SCENE_CATEGORY" + type;
            const map = <Map<string, IScene[]>>this.config.getScenesByCategory(sceneType, tag);
            if (map) {
                map.forEach((value, key) => {
                    if (key !== "undefined") {
                        tempDatas = tempDatas.concat(value);
                    }
                });
            }
            if (!obj) {
                obj = { type: sceneType, name: this.config.getI18n(sceneType), datas: tempDatas };
                tempArr.push(obj);
            }
            obj.datas = tempDatas;
        }
        return tempArr;
    }

    private getMyRoomDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST) {
        const levels = this.config.getLevels("playerLevel");
        const curLevel = this.game.user.userData.level;
        const created = content.rooms.length;
        let beforecount = 0;
        let unlockcount = 0;
        const lockArr = [];
        for (const temp of levels) {
            if (!temp.unlockRoom) continue;
            const unlockRoom = temp.unlockRoom + 1;
            if (temp.level <= curLevel) {
                if (created < unlockRoom) {
                    unlockcount = unlockRoom - created;
                }
            } else {
                const count = unlockRoom - beforecount;
                if (count > 0) lockArr.push({ level: temp.level, count });

            }
            beforecount = unlockRoom;
        }
        for (const item of content.rooms) {
            item["created"] = true;
        }
        for (let i = 0; i < unlockcount; i++) {
            const index = created + i + 1;
            const data: any = { serial: index, unlocked: true, created: false };
            content.rooms.push(data);
        }
        let lockindex = created + unlockcount;
        for (const temp of lockArr) {
            for (let i = 0; i < temp.count; i++) {
                const tempindex = lockindex + i + 1;
                const data: any = { serial: tempindex, unlocked: false, created: false, unlocklevel: temp.level };
                content.rooms.push(data);
            }
            lockindex += temp.count;
        }
        return content;
    }
    private get model(): PicaPartyNavigation {
        return (<PicaPartyNavigation>this.mModel);
    }
    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
