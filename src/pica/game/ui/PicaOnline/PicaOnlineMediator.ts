import { BasicMediator, DataMgrType, Game, SceneDataManager, UIType } from "gamecore";
import { ModuleName } from "structure";
import { PicaOnline } from "./PicaOnline";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaOnlineMediator extends BasicMediator {
    protected mModel: PicaOnline;
    protected blacklist = [];
    constructor(game: Game) {
        super(ModuleName.PICAONLINE_NAME, game);
        this.mModel = new PicaOnline(this.game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        //  this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_retOnlineInfo", this.onOnlineHandler, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_anotherinfo", this.on_Another_Info, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_openingcharacter", this.onOpeningCharacterHandler, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_block", this.onBlockUserHandler, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_close", this.onCloseHandler, this);
    }

    hide() {
        //  this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_retOnlineInfo", this.onOnlineHandler, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_anotherinfo", this.on_Another_Info, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_openingcharacter", this.onOpeningCharacterHandler, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_block", this.onBlockUserHandler, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_close", this.onCloseHandler, this);
        super.hide();
    }
    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
            this.mModel = undefined;
        }
        super.destroy();
    }

    protected onEnable() {
        this.proto.on("CURRENT_ROOM_PLAYER_LIST", this.onOnlineHandler, this);
        this.proto.on("ANOTHER_PLAYER_INFO", this.on_Another_Info, this);
    }
    protected onDisable() {
        this.proto.off("CURRENT_ROOM_PLAYER_LIST", this.onOnlineHandler, this);
        this.proto.off("ANOTHER_PLAYER_INFO", this.on_Another_Info, this);
    }

    protected panelInit() {
        if (this.panelInit) {
            this.mModel.fetchOnlineInfo();
            this.blacklist.length = 0;
            this.mModel.getBanlist().then((response) => {
                if (response.code === 200) {
                    const arrs = response.data;
                    for (const item of arrs) {
                        if (item.ban && item.ban_user) {
                            this.blacklist.push(item.ban_user._id);
                        }
                    }
                    this.mView.setBlackList(this.blacklist);
                }
            });
        }
    }

    private onCloseHandler() {
        if (!this.game) {
            return;
        }
        this.hide();
    }

    private async onOnlineHandler(proto: any) {
        const content = proto.content;
        const uids = [];
        const infos = [];
        for (const data of content.playerInfos) {
            uids.push(data.platformId);
            infos.push(data);
        }
        const avatars = [];
        this.mModel.getHeadImgList(uids).then((response) => {
            if (response.code === 200) {
                const datas: any[] = response.data;
                for (const data of datas) {
                    avatars.push(data);
                }
                this.mView.setAvatarList(avatars);
            }
        });
        const mgr = this.game.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
        if (mgr.curRoom)
            this.mView.setOnlineDatas(infos, mgr.curRoom.playerCount, this.game.user.userData.cid);
    }
    private on_Another_Info(proto: any) {
        const content = proto.content;
        if (this.mPanelInit) {
            const uimanager = this.game.uiManager;
            uimanager.showMed(ModuleName.PICAPLAYERINFO_NAME, content);
            this.hide();
        }
    }
    private onOpeningCharacterHandler(id: string) {
        if (id === this.game.user.userData.cid) {
            const uimanager = this.game.uiManager;
            uimanager.showMed(ModuleName.PICAPLAYERINFO_NAME);
            this.mModel.fetchPlayerInfo();
        } else {
            this.mModel.fetchAnotherInfo(id);
        }
    }

    private onBlockUserHandler(data: { uid: string, black: boolean }) {
        if (data.black) {
            this.game.httpService.banUser(data.uid).then((response: any) => {
                const { code, temp } = response;
                if (code === 200 || code === 201) {
                    this.blacklist.push(data.uid);
                    this.mView.setBlackList(this.blacklist);
                }
            });
        } else {
            this.game.httpService.removeBanUser(data.uid).then((response: any) => {
                const { code, temp } = response;
                if (code === 200 || code === 201) {
                    //  this.checkRelation(id);
                    const index = this.blacklist.indexOf(data.uid);
                    if (index !== -1) {
                        this.blacklist.splice(index, 1);
                        this.mView.setBlackList(this.blacklist);
                    }
                }
            });
        }

    }

}
