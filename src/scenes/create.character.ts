import { ICreateRole } from "../role/create.role";
import { LoginScene } from "./login";
import { LoadingScene } from "./loading";

export class CreateRoleScene extends Phaser.Scene {
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