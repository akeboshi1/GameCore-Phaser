import { World } from "../game/world";

export class SelectCharacter extends Phaser.Scene {
  private mWorld: World | undefined;
  constructor() {
    super({key: SelectCharacter.name})
  }

  preload() { }

  init(data: any) {
    this.mWorld = data;
  }

  create() { }
}