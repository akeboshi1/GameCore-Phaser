import { ICreateRole } from "../role/create.role";
import { LoadingScene } from "./loading";
import { BasicScene } from "./basic.scene";

export class CreateRoleScene extends BasicScene {
  private role: ICreateRole;
  constructor() {
    super({ key: CreateRoleScene.name });
  }

  init(data: any) {
    if (data.role) {
      this.role = data.role;
    }
  }

  create() {
    if (this.role) {
      this.game.scene.stop(LoadingScene.name);
      this.role.start(this);
    }
  }
}
