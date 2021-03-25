import { UIManager, Game, BasicMediator } from "gamecore";
import { ModuleName } from "structure";
import { CutInMediator } from "./CutIn";
import { DialogMediator } from "./Dialog";
import { LoginMediator } from "./Login";
import { BottomMediator } from "./Bottom/BottomMediator";
import { PicaFurniFunMediator } from "./PicaFurniFun/PicaFurniFunMediator";
import { PicaNewMainMediator } from "./PicaNewMain/PicaNewMainMediator";
import { BaseDataConfigManager } from "../config";
import { Logger } from "utils";
export class PicaWorkerUiManager extends UIManager {
    constructor(game: Game) {
        super(game);
    }

    public showMainUI(hideNames?: string[]) {
        this.setMedName(ModuleName.LOGIN_NAME, LoginMediator);
        this.setMedName(ModuleName.DIALOG_NAME, DialogMediator);
        this.setMedName(ModuleName.CUTIN_NAME, CutInMediator);
        this.setMedName(ModuleName.BOTTOM, BottomMediator);
        this.setMedName(ModuleName.PICANEWMAIN_NAME, PicaNewMainMediator);
        this.setMedName(ModuleName.PICAFURNIFUN_NAME, PicaFurniFunMediator);

        // this.mMedMap.set(ModuleName.ACTIVITY_NAME, new ActivityMediator(this.game));
        // this.mMedMap.set(ModuleName.PICACHAT_NAME, new PicaChatMediator(this.game));
        // this.mMedMap.set(ModuleName.PICAMAINUI_NAME, new PicaMainUIMediator(this.game));
        // this.mMedMap.set(ModuleName.PICANEWMAIN_NAME, new PicaNewMainMediator(this.game));
        // this.mMedMap.set(ModuleName.PICAFURNIFUN_NAME, new PicaFurniFunMediator(this.game)); // 这个的确要弄成全局的..
        if (!this.checkActiveUIState(ModuleName.PICANEWMAIN_NAME)) {
            if (hideNames) {
                hideNames.push(ModuleName.PICANEWMAIN_NAME);
            } else {
                hideNames = [ModuleName.PICANEWMAIN_NAME];
            }
        }
        super.showMainUI(hideNames);
    }

    public setMedName(name: string, medClass: any) {
        if (!this.mMedMap.get(name)) this.mMedMap.set(name, new medClass(this.game));
    }

    // public showDecorateUI() {
    //     this.clearMediator();
    //     this.mMedMap.set(ModuleName.PICADECORATECONTROL_NAME, new PicaDecorateControlMediator(this.game));
    //     this.mMedMap.set(ModuleName.PICADECORATE_NAME, new PicaDecorateMediator(this.game));
    //     super.showDecorateUI();
    //     // this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, this.mScene, this.worldService));
    // }

    public showMed(type: string, param: any) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        if (!this.checkActiveUIState(type)) return;
        Logger.getInstance().log("type ====>", type);
        switch (type) {
            case ModuleName.PICABAGGUIDE_NAME:
            case ModuleName.PICAEXPLOREGUIDE_NAME:
            case ModuleName.PICAHOMEGUIDE_NAME:
            case ModuleName.PICAHOTELGUIDE_NAME:
            case ModuleName.PICAPLANEGUIDE_NAME:
            case ModuleName.PICAROOMGUIDE_NAME:
                const guideConfig = (<BaseDataConfigManager>this.game.configManager).findGuideByUiGuide(type);
                if (guideConfig && !guideConfig.state) {
                    param.guideID = guideConfig.id;
                    this.game.peer.render.showPanel(type, param);
                }
                break;
            default:
                const className: string = type + "Mediator";
                let mediator: BasicMediator = this.mMedMap.get(type);
                if (!mediator) {
                    // const path: string = `./${type}/${type}Mediator`;
                    let ns: any = require(`./${type}/${className}`);
                    if (!ns) {
                        ns = this.getMediatorClass(type);
                    }
                    mediator = new ns[className](this.game);
                    if (!mediator) {
                        super.showMed(type, param);
                        // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                        return;
                    }
                    this.mMedMap.set(type, mediator);
                    // mediator.setName(type);
                }
                // if (mediator.showing) return;
                if (param) mediator.setParam(param);
                if (mediator.isShow()) return;
                mediator.show(param);
                break;
        }
    }
    protected getPanelNameByAlias(tag: string) {
        switch (tag) {
            case "mainui":
                return ModuleName.PICANEWMAIN_NAME;
            case "bottom":
                return ModuleName.BOTTOM;
            case "minirole":
                return ModuleName.PICANEWROLE_NAME;
            case "MessageBox":
                return "PicaMessageBox";
        }
        return tag;
    }

    protected checkActiveUIState(panelName: string) {
        const datas = this.getUIStateData(panelName);
        if (!datas) return true;
        for (const data of datas) {
            const tempName = this.getPanelNameByAlias(data.name);
            if (tempName === panelName) {
                return data.visible;
            }
        }
        return true;
    }
}
