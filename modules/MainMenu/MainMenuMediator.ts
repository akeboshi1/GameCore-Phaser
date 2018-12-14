import {MediatorBase} from "../../base/module/core/MediatorBase";
import {MainMenuView} from "./view/MainMenuView";
import Globals from "../../Globals";
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";

export class MainMenuMediator extends MediatorBase {

  private get view(): MainMenuView {
    return this.viewComponent as MainMenuView;
  }

  public onRegister(): void {
    this.view.on("open", this.openHandle, this);
  }

  private openHandle(): void {
      Globals.ModuleManager.openModule(ModuleTypeEnum.BAG);
  }
}
