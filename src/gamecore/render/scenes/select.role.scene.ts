import { BasicScene } from "baseRender";
import { SceneName } from "structure";

export class SelectRoleScene extends BasicScene {
  private mWorld: any | undefined;
  constructor() {
    super({ key: SceneName.SELECTROLE_SCENE });
  }

  public preload() { }

  public init(data: any) {
    this.mWorld = data;
  }

  public create() {
    super.create();
  }

  get key(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
}
