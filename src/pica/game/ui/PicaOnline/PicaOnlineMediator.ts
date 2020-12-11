import { BasicMediator, DataMgrType, Game, SceneDataManager, UIType } from "gamecore";
import { ModuleName } from "structure";
import { PicaOnline } from "./PicaOnline";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaOnlineMediator extends BasicMediator {
    protected mModel: PicaOnline;
    constructor(game: Game) {
        super(ModuleName.PICAONLINE_NAME, game);
        this.mModel = new PicaOnline(this.game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_retOnlineInfo", this.onOnlineHandler, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_anotherinfo", this.on_Another_Info, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_openingcharacter", this.onOpeningCharacterHandler, this);
        this.game.emitter.on(ModuleName.PICAONLINE_NAME + "_close", this.onCloseHandler, this);
    }

    hide() {
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_retOnlineInfo", this.onOnlineHandler, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_anotherinfo", this.on_Another_Info, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_openingcharacter", this.onOpeningCharacterHandler, this);
        this.game.emitter.off(ModuleName.PICAONLINE_NAME + "_close", this.onCloseHandler, this);
        super.hide();
    }

    panelInit() {
        if (this.panelInit) {
            this.mModel.fetchOnlineInfo();
        }
    }

    destroy() {
        if (this.mModel) {
            this.mModel.destroy();
            this.mModel = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        if (!this.game) {
            return;
        }
        const uiManager = this.game.uiManager;
        const mediator = uiManager.getMed(ModuleName.PICACHAT_NAME);
        mediator.show();
        this.hide();
    }

    private async onOnlineHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_ROOM_PLAYER_LIST) {
        const uids = [];
        const map = new Map<string, any>();
        for (const data of content.playerInfos) {
            uids.push(data.platformId);
            map.set(data.platformId, data);
        }
        const headimg: any = await this.game.httpService.userHeadsImage(uids);
        if (headimg.code === 200) {
            const datas: any[] = headimg.data;
            for (const data of datas) {
                const id = data._id;
                const avatar = data.avatar;
                const info = map.get(id);
                info.avatar = avatar;
            }
        }
        const mgr = this.game.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
        this.mView.setOnlineDatas(Array.from(map.values()), mgr.curRoom.playerCount);
    }
    private on_Another_Info(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO) {
        if (this.panelInit) {
            const uimanager = this.game.uiManager;
            uimanager.showMed(ModuleName.CHARACTERINFO_NAME, content);
            this.hide();
        }
    }
    private onOpeningCharacterHandler(id: string) {
        this.mModel.fetchAnotherInfo(id);
    }
}
