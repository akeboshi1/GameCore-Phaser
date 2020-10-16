import { LoadingScene } from "./loading.scene";
import { BasicScene } from "./basic.scene";

export class CreateRoleScene extends BasicScene {
  private role: any;
  constructor() {
    super({ key: CreateRoleScene.name });
  }

  init(data: any) {
    if (data.role) {
      this.role = data.role;
      // data.createRole
    }
  }

  create() {
    if (this.role) {
      this.game.scene.stop(LoadingScene.name);
      this.role.start(this);
    }
  }
}
