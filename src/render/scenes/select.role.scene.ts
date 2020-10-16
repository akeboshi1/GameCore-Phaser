
export class SelectRoleScene extends Phaser.Scene {
  private mWorld: any | undefined;
  constructor() {
    super({ key: SelectRoleScene.name });
  }

  public preload() { }

  public init(data: any) {
    this.mWorld = data;
  }

  public create() {

  }

  get key(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
}
