import { BasicMediator, Game } from "gamecore";
import { BaseDataConfigManager } from "picaWorker";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { PicaHouse } from "./PicaHouse";

export class PicaHouseMediator extends BasicMediator {
    private picaHouse: PicaHouse;
    constructor(game: Game) {
        super(ModuleName.PICAHOUSE_NAME, game);
        this.picaHouse = new PicaHouse(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_hide", this.onHideHandler, this);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_scenedecorate", this.onSendEnterDecorate, this);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_queryrequirements", this.query_REFURBISH_REQUIREMENTS, this);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_queryrefurbish", this.query_ROOM_REFURBISH, this);

        this.game.emitter.on("roominfo", this.onRoomInfoHandler, this);
        this.game.emitter.on("refurbish", this.on_REFURBISH_REQUIREMENTS, this);
    }

    hide() {
        super.hide();
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_hide", this.onHideHandler, this);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_scenedecorate", this.onSendEnterDecorate, this);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_queryrequirements", this.query_REFURBISH_REQUIREMENTS, this);
        this.game.emitter.on(ModuleName.PICAHOUSE_NAME + "_queryrefurbish", this.query_ROOM_REFURBISH, this);

        this.game.emitter.on("roominfo", this.onRoomInfoHandler, this);
        this.game.emitter.on("refurbish", this.on_REFURBISH_REQUIREMENTS, this);
    }

    destroy() {
        if (this.picaHouse) {
            this.picaHouse.destroy();
            this.picaHouse = undefined;
        }
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        this.queryRoomInfoHandler();
    }

    private onRoomInfoHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        const isSelfRoom = this.game.user.userData.isSelfRoom;
        this.mView.setRoomInfoData(content, isSelfRoom);
    }

    private queryRoomInfoHandler() {
        const curRoomID = this.game.user.userData.curRoomID;
        if (curRoomID) {
            this.picaHouse.queryRoomInfo(curRoomID);
        }
    }

    private query_REFURBISH_REQUIREMENTS(roomid) {
        this.picaHouse.query_REFURBISH_REQUIREMENTS(roomid);
    }
    private query_ROOM_REFURBISH(roomid) {
        this.picaHouse.query_ROOM_REFURBISH(roomid);
    }

    private on_REFURBISH_REQUIREMENTS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS) {
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        configMgr.getBatchItemDatas(content.requirements);
        this.mView.on_REFURBISH_REQUIREMENTS(content);
    }

    private onHideHandler() {
        this.destroy();
    }

    private onSendEnterDecorate() {
        this.picaHouse.sendEnterDecorate();
    }
}
