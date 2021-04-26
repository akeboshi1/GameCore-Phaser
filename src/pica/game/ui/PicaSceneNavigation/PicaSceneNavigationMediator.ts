import { op_client } from "pixelpai_proto";
import { PicaSceneNavigation } from "./PicaSceneNavigation";
import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { IScene } from "../../../structure";
export class PicaSceneNavigationMediator extends BasicMediator {
    private mPlayerProgress: any;
    private mPartyListData: any;
    private tempData: any;
    private chooseType: number = 1;
    constructor(game: Game) {
        super(ModuleName.PICASCENENAVIGATION_NAME, game);

        if (!this.mModel) {
            this.mModel = new PicaSceneNavigation(game);
            this.game.emitter.on(this.key + "_enterRoomResult", this.onEnterRoomResultHandler, this);
        }
    }

    show(param?: any) {
        this.chooseType = Number(param || 1);
        super.show(param);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_queryenter", this.queryEnterRoom, this);

    }

    hide() {
        this.tempData = undefined;
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_queryenter", this.queryEnterRoom, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off(this.key + "_enterRoomResult", this.onEnterRoomResultHandler, this);
        super.destroy();
    }

    isSceneUI() {
        return false;
    }

    protected panelInit() {
        super.panelInit();
        this.setNavigationData();
    }

    private onCloseHandler() {
        this.hide();
    }

    private queryEnterRoom(roomID: string) {
        this.model.queryEnterRoom(roomID);
    }

    private onEnterRoomResultHandler(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM) {

    }

    private setNavigationData() {
        if (!this.tempData) {
            const map = <Map<string, IScene[]>>this.config.getScenesByCategory(undefined, 1);
            const arr = [];
            map.forEach((value, key) => {
                if (key !== "undefined") {
                    const obj = { type: key, name: this.config.getI18n(key), datas: value };
                    arr.push(obj);
                }
            });
            this.tempData = arr;
        }
        if (!this.mPanelInit) return;
        this.mView.setNavigationListData(this.tempData);
    }
    private get model(): PicaSceneNavigation {
        return (<PicaSceneNavigation>this.mModel);
    }
    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
