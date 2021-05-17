import { BasicMediator, CacheDataManager, DataMgrType, Game, PlayerProperty } from "gamecore";
import { op_client } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { CutInMenu } from "./CutInMenu";

export class CutInMenuMediator extends BasicMediator {
    protected mModel: CutInMenu;
    private mUIMap: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI[];
    constructor(game: Game) {
        super(ModuleName.CUTINMENU_NAME, game);
        this.mModel = new CutInMenu(game);
    }

    show(param?: any) {
        super.show(param);
        this.append(param);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_rightButton", this.onRightButtonHandler, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_openmed", this.openPanelMediator, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_openmedsurvey", this.openSurveyMediator, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_editor", this.onOpenEditorHandler, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_dropElement", this.onDropElementHandler, this);
        if (this.buttonType === "work" || this.buttonType === "survey") {
            this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        }
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_rightButton", this.onRightButtonHandler, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_openmed", this.openPanelMediator, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_openmedsurvey", this.openSurveyMediator, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_editor", this.onOpenEditorHandler, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_dropElement", this.onDropElementHandler, this);
        if (this.buttonType === "work" || this.buttonType === "survey") {
            this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        }
        this.mUIMap = null;
    }

    setParam(param?: any) {
        super.setParam(param);
        this.append(param);
        if (this.mView) {
            this.mView.changePop(param);
        }
        // this.mView.set
    }

    panelInit() {
        super.panelInit();
        if (this.playerInfo) this.onUpdatePlayerInfo(this.playerInfo);
    }

    closePop(text: string) {
        if (!this.mUIMap) {
            this.hide();
            return;
        }
        const index = this.mUIMap.findIndex((ui) => ui.button[0].text === text);
        if (index === -1) {
            return;
        }
        this.mUIMap.splice(index, 1);
        if (this.mUIMap.length < 1) {
            this.hide();
            return;
        }
        this.mShowData = this.mUIMap[0];
        if (this.mView) {
            this.mView.changePop(this.mShowData);
        }
    }

    get playerInfo() {
        const playerInfo = this.game.user.userData.playerProperty;
        return playerInfo;
    }

    private append(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (!data) return;
        if (data.button.length < 1) return;
        if (!this.mUIMap) {
            this.mUIMap = [];
        }
        const index = this.mUIMap.find((ui) => ui.button[0].text === data.button[0].text);
        if (!index) {
            this.mUIMap.push(data);
        }
        // const button = data.button[0];
        // this.mUIMap.set(button.text, data);
    }

    private onUpdatePlayerInfo(content: PlayerProperty) {
        if (this.mView) {
            if (this.buttonType === "work") {
                this.mView.setPopData(content.workChance.value);
            } else if (this.buttonType === "survey") {
                this.mView.setPopData(content.survey.value);
            }
        }
    }
    private onRightButtonHandler(uiid: number, btnid: number) {
        this.mModel.reqRightButton(uiid, btnid);
    }

    private openPanelMediator(panel: string, data: any) {
        const uiManager = this.game.uiManager;
        if (data)
            uiManager.showMed(panel, data);
        else uiManager.showMed(panel);
    }

    private openSurveyMediator() {
        if (!this.cacheMgr.isSurveyStatus)
            this.openPanelMediator(ModuleName.PICASURVEY_NAME, undefined);
        else this.game.uiManager.hideMed(ModuleName.PICASURVEY_NAME);
    }

    private onOpenEditorHandler() {
        this.game.roomManager.currentRoom.requestDecorate();
        this.hide();
    }

    private onDropElementHandler() {
        this.mModel.dropElement();
    }

    private onHideView() {
        this.hide();
    }
    private get buttonType() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData;
        const button = data.button[0];
        return button.text;
    }

    private get cacheMgr() {
        return this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
    }

}
