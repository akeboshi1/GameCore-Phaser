import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { Logger } from "utils";
import { PicaMainUI } from "./PicaMainUI";

export class PicaMainUIMediator extends BasicMediator {
    private mPlayerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    private mRoomInfo: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    constructor(protected game: Game) {
        super(ModuleName.PICAMAINUI_NAME, game);
        this.mModel = new PicaMainUI(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on("showPanel", this.onShowPanelHandler, this);
        this.game.emitter.on("openroompanel", this.onOpenRoomHandler, this);
        this.game.emitter.on("querypraise", this.onQuery_PRAISE_ROOM, this);
        this.game.emitter.on("updateroom", this.onUpdateRoomHandler, this);
        this.game.emitter.on("updateDetail", this.onUpdateDetailHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off("showPanel", this.onShowPanelHandler, this);
        this.game.emitter.off("openroompanel", this.onOpenRoomHandler, this);
        this.game.emitter.off("querypraise", this.onQuery_PRAISE_ROOM, this);
        this.game.emitter.off("updateroom", this.onUpdateRoomHandler, this);
        this.game.emitter.off("updateDetail", this.onUpdateDetailHandler, this);
    }

    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
        }
        this.mPlayerInfo = undefined;
        this.mRoomInfo = undefined;
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    protected panelInit() {
        if (this.mView) {
            this.mShowData = this.playerInfo;
            this.mView.update(this.mShowData);
        }
    }

    private onShowPanelHandler(panel: string, data?: any) {
        if (!this.mModel || !this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.showMed(panel);
        if (panel === ModuleName.CHARACTERINFO_NAME) {
            (<PicaMainUI>this.mModel).fetchPlayerInfo();
        } else if (panel === ModuleName.PICAOPENPARTY_NAME) {

        }

        // const uiManager = this.world.uiManager;
        // if (data)
        //     uiManager.showMed(panel, data);
        // else uiManager.showMed(panel);
    }

    private onUpdateRoomHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.mRoomInfo = content;
        this.game.user.userData.curRoomID = content.roomId;
        if (this.mPanelInit) {
            this.mShowData = this.mRoomInfo;
            if (this.mView && this.mShowData)
                this.mView.update(this.mShowData);
        }
        this.fetchDetail();
    }

    private onOpenRoomHandler() {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const uimanager = this.game.uiManager;
        uimanager.showMed("PicHouse");
    }

    private onQuery_PRAISE_ROOM(praise: boolean) {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const roomid = this.mRoomInfo.roomId;
        (<PicaMainUI>this.mModel).query_PRAISE_ROOM(roomid, praise);
    }

    private async fetchDetail() {
        const account = await this.game.renderPeer.getAccount();
        if (account) {
            const accoutnData = account.accountData;
            const detail: any = await this.game.httpService.userDetail(accoutnData.id);
            this.mView.updateDetail(detail.data);
        }
    }

    private onUpdateDetailHandler() {
        this.fetchDetail();
    }

    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty.playerInfo;
        return this.mPlayerInfo;
    }

    get roomInfo() {
        return this.mRoomInfo;
    }

    get isSelfRoom() {
        if (!this.playerInfo || !this.roomInfo) return false;
        const rooms = this.playerInfo.rooms;
        const curRoomid = this.roomInfo.roomId;
        for (const room of rooms) {
            if (room.roomId === curRoomid) return true;
        }
        return false;
    }
}
