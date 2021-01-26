import { BasicScene } from "./basic.scene";
import { UiManager } from "../ui/ui.manager";
import { SceneName } from "structure";
import { Logger } from "utils";

export class CreateRoleScene extends BasicScene {
  private params: any;
  constructor() {
    super({ key: SceneName.CREATE_ROLE_SCENE });
  }

  public init(data?: any) {
    super.init(data);
    this.params = data.params;
  }

  public create() {
    if (this.render) {
      const uimanager: UiManager = this.render.uiManager;
      uimanager.setScene(this);
      Logger.getInstance().debug("createrole===scene");
      // uimanager.showPanel(ModuleName.CREATEROLE_NAME, this.params);
      // this.render.hideLoading();
    }
    super.create();
  }

  public stop() {
    if (this.render) {
      this.render.showMediator("CreateRoleScene", false);
    }
    super.stop();
  }

}
