import {MediatorBase} from "../../base/module/core/MediatorBase";
import {MainMenuView} from "./view/MainMenuView";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
import Globals from "../../Globals";

export class MainMenuMediator extends MediatorBase {
    private get view(): MainMenuView {
        return this.viewComponent as MainMenuView;
    }

    public onRegister(): void {
        this.view.on("open", this.openHandle);
    }

    private openHandle(): void {
        Globals.ModuleManager.openModule(ModuleTypeEnum.BAG);
    }
}