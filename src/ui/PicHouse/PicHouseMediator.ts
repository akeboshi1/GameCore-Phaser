import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { PicHousePanel } from "./PicHousePanel";
import { PicHouse } from "./PicHouse";
import { PicaMainUIMediator } from "../PicaMainUI/PicaMainUIMediator";
import { BaseMediator } from "apowophaserui";

export class PicHouseMediator extends BaseMediator {
    protected mView: PicHousePanel;
    private scene: Phaser.Scene;
    private picHouse: PicHouse;
    private world: WorldService;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super();
        this.world = worldService;
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        if (!this.picHouse) {
            this.picHouse = new PicHouse(this.world);
            this.picHouse.on("roominfo", this.onRoomInfoHandler, this);
            this.picHouse.on("refurbish", this.on_REFURBISH_REQUIREMENTS, this);
            this.picHouse.register();
        }

        if (!this.mView) {
            this.mView = new PicHousePanel(this.scene, this.world);
            this.mView.on("hide", this.onHideHandler, this);
            this.mView.on("scenedecorate", this.onSendEnterDecorate, this);
            this.mView.on("queryrequirements", this.query_REFURBISH_REQUIREMENTS, this);
            this.mView.on("queryrefurbish", this.query_ROOM_REFURBISH, this);
        }

        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
        this.queryRoomInfoHandler();
    }

    hide() {
        super.hide();
        this.layerManager.removeToUILayer(this.mView);
    }

    getView(): BasePanel {
        return this.mView;
    }

    destroy() {
        if (this.picHouse) {
            this.picHouse.destroy();
            this.picHouse = undefined;
        }
        super.destroy();
    }

    private onRoomInfoHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        const uimananger = this.world.uiManager;
        const mediator = <PicaMainUIMediator>uimananger.getMediator("PicaMainUIMediator");
        this.mView.setRoomInfoData(content, mediator.isSelfRoom);
    }

    private queryRoomInfoHandler() {
        const uimananger = this.world.uiManager;
        const mediator = <PicaMainUIMediator>uimananger.getMediator("PicaMainUIMediator");
        const roominfo = mediator.roomInfo;
        if (roominfo) {
            this.picHouse.queryRoomInfo(roominfo.roomId);
        }
    }

    private query_REFURBISH_REQUIREMENTS(roomid) {
        this.picHouse.query_REFURBISH_REQUIREMENTS(roomid);
    }
    private query_ROOM_REFURBISH(roomid) {
        this.picHouse.query_ROOM_REFURBISH(roomid);
    }

    private on_REFURBISH_REQUIREMENTS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS) {
        this.mView.on_REFURBISH_REQUIREMENTS(content);
    }

    private onHideHandler() {
        this.destroy();
    }

    private onSendEnterDecorate() {
        this.picHouse.sendEnterDecorate();
    }
}
