import { BasicMediator, Game, PlayerProperty } from "gamecore";
import { op_client } from "pixelpai_proto";
import { EventType, ModuleName } from "structure";
import { CutInMenu } from "./CutInMenu";

export class CutInMenuMediator extends BasicMediator {
    private cutInMenu: CutInMenu;
    constructor(game: Game) {
        super(ModuleName.CUTINMENU_NAME, game);
        this.cutInMenu = new CutInMenu(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_rightButton", this.onRightButtonHandler, this);
        this.game.emitter.on(ModuleName.CUTINMENU_NAME + "_openmed", this.openPanelMediator, this);
        if (this.buttonType === "work") {
            this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        }
        if (this.playerInfo) this.onUpdatePlayerInfo(this.playerInfo);
    }

    hide() {
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_rightButton", this.onRightButtonHandler, this);
        this.game.emitter.off(ModuleName.CUTINMENU_NAME + "_openmed", this.openPanelMediator, this);
        if (this.buttonType === "work") {
            this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        }
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.cutInMenu) {
            this.cutInMenu.destroy();
            this.cutInMenu = undefined;
        }
        super.destroy();
    }
    get playerInfo() {
        const playerInfo = this.game.user.userData.playerProperty;
        return playerInfo;
    }
    private onUpdatePlayerInfo(content: PlayerProperty) {
        if (this.mView)
            this.mView.setPopData(content.workChance.value);
    }
    private onRightButtonHandler(uiid: number, btnid: number) {
        this.cutInMenu.reqRightButton(uiid, btnid);
    }

    private openPanelMediator(panel: string, data: any) {
        const uiManager = this.game.uiManager;
        if (data)
            uiManager.showMed(panel, data);
        else uiManager.showMed(panel);
    }
    private onHideView() {
        this.hide();
    }
    private get buttonType() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData;
        const button = data.button[0];
        return button.text;
    }

}
