import { BasicScene } from "./basic.scene";
import { UiManager } from "../ui/ui.manager";
import { LoadingScene } from "./loading.scene";

export class CreateRoleScene extends BasicScene {
  private params: any;
  constructor() {
    super({ key: CreateRoleScene.name });
  }

  public init(data?: any) {
    super.init(data);
    this.params = data.params;
  }

  public create() {
    if (this.render) {
      const uimanager: UiManager = this.render.uiManager;
      uimanager.setScene(this);
      uimanager.showPanel("CreateRole", this.params);
      this.render.sceneManager.sleepScene(LoadingScene.name);
    }
  }

}
