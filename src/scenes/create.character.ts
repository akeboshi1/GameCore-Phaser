import { ICharacter } from "../character/create.character";

export class CreateCharacterScene extends Phaser.Scene {
  private character: ICharacter;
  constructor() {
    super({key: CreateCharacterScene.name});
  }

  init(data: any) {
    if (data.character) {
      this.character = data.character;
    }
  }

  create() {
    if (this.character) {
      this.character.start(this);
    }
  }
}
