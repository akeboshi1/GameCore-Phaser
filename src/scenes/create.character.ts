import { ICreateRole } from "../role/create.role";

export class CreateRoleScene extends Phaser.Scene {
  private role: ICreateRole;
  constructor() {
    super({key: CreateRoleScene.name});
  }

  init(data: any) {
    if (data.role) {
      this.role = data.role;
    }
  }

  create() {
    if (this.role) {
      this.role.start(this);
    }
  }
}
