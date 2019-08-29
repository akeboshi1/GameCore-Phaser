import { World } from "../game/world";

export class SelectCharacter extends Phaser.Scene {
  private mWorld: World | undefined;
  constructor() {
    super({key: SelectCharacter.name});
  }

  public preload() { }

  public init(data: any) {
    this.mWorld = data;
  }

  public create() { }
}
