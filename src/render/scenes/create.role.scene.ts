import { BasicScene } from "./basic.scene";
import { UiManager } from "../ui/ui.manager";
import { LoadingScene } from "./loading.scene";
import { ModuleName, SceneName } from "structure";

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
    super.create();
    if (this.render) {
      const uimanager: UiManager = this.render.uiManager;
      uimanager.setScene(this);
      uimanager.showPanel(ModuleName.CREATEROLE_NAME, this.params);
      this.render.sceneManager.sleepScene(LoadingScene.name);
    }
  }

}
