import { BasicMediator, DataMgrType, Game, PlayerProperty, SceneDataManager } from "gamecore";
import { op_client } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { PicaNewMain } from "./PicaNewMain";

export class PicaNewMainMediator extends BasicMediator {
    protected mModel: PicaNewMain;
    constructor(protected game: Game) {
        super(ModuleName.PICANEWMAIN_NAME, game);
        this.mModel = new PicaNewMain(this.game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(EventType.QUERY_PRAISE, this.onQuery_PRAISE_ROOM, this);
        this.game.emitter.on(ModuleName.PICANEWMAIN_NAME + "_openhousepanel", this.onOpenHouseHandler, this);
        this.game.emitter.on(ModuleName.PICANEWMAIN_NAME + "_showpanel", this.onShowPanelHandler, this);
        this.game.emitter.on(ModuleName.PICANEWMAIN_NAME + "_explorechapter", this.onExploreChapterHandler, this);
        this.game.emitter.on(EventType.UPDATE_ROOM_INFO, this.onUpdateRoomHandler, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerHandler, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(EventType.QUERY_PRAISE, this.onQuery_PRAISE_ROOM, this);
        this.game.emitter.off(ModuleName.PICANEWMAIN_NAME + "_openhousepanel", this.onOpenHouseHandler, this);
        this.game.emitter.off(ModuleName.PICANEWMAIN_NAME + "_showpanel", this.onShowPanelHandler, this);
        this.game.emitter.off(ModuleName.PICANEWMAIN_NAME + "_explorechapter", this.onExploreChapterHandler, this);
        this.game.emitter.off(EventType.UPDATE_ROOM_INFO, this.onUpdateRoomHandler, this);
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerHandler, this);
    }

    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
        }
        super.destroy();
    }

    isSceneUI() {
        return true;
    }

    protected panelInit() {
        super.panelInit();
        if (this.mView) {
            if (this.playerInfo) this.onUpdatePlayerHandler(this.playerInfo);
            if (this.roomInfo) this.onUpdateRoomHandler(this.roomInfo);
        }
    }

    private onUpdateRoomHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        if (this.mPanelInit) {
            if (this.mView)
                this.mView.setRoomInfo(content.name, content.hasPraised, content.playerCount, content.roomType, this.isSelfRoom);
        }
    }

    private onUpdatePlayerHandler(content: PlayerProperty) {
        if (this.mPanelInit) {
            if (this.mView) {
                const money = content.coin ? content.coin.value : 0;
                const diamond = content.diamond ? content.diamond.value : 0;
                this.mView.setPlayerInfo(content.level, content.energy, money, diamond);
            }
        }
    }

    private onOpenHouseHandler() {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const uimanager = this.game.uiManager;
        uimanager.showMed("PicHouse");
    }

    private onQuery_PRAISE_ROOM(praise: boolean) {
        if (!this.roomInfo || this.roomInfo.roomType !== "room" && this.roomInfo.roomType !== "store") return;
        const roomid = this.roomInfo.roomId;
        this.mModel.query_PRAISE_ROOM(roomid, praise);
    }
    private onShowPanelHandler(panel: string, data?: any) {
        if (!this.mModel || !this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        uiManager.showMed(panel);
        if (panel === ModuleName.CHARACTERINFO_NAME) {
            this.mModel.fetchPlayerInfo();
        } else if (panel === ModuleName.PICAOPENPARTY_NAME) {

        }
    }
    private onExploreChapterHandler() {
        this.mModel.queryExploreChapter(this.playerInfo.playerInfo.nextChapterId);
    }
    get playerInfo() {
        const info = this.game.user.userData.playerProperty;
        return info;
    }

    get roomInfo() {
        const dataMgr = this.game.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
        return dataMgr.curRoom;
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
