import { CharacterManager } from "./character.manager";
import { WorldService } from "../game/world.service";
import { CreateCharacterScene } from "../scenes/create.character";
import { CreateCharacterPanel } from "./create.character.panel";

export interface ICharacter {
  enter();
  start(scene: Phaser.Scene);
  destroy();
}

export class CreateCharacter {
  private readonly characterManager: CharacterManager;
  private createPanel: CreateCharacterPanel;
  private world: WorldService;
  constructor($characterManager: CharacterManager) {
    this.characterManager = $characterManager;
    this.world = this.characterManager.world;
  }

  enter() {
    if (!this.world.game.scene.getScene(CreateCharacterScene.name))
      this.world.game.scene.add(CreateCharacterScene.name, CreateCharacterScene);
    this.world.game.scene.start(CreateCharacterScene.name, {
      world: this.world,
      character: this
    });
  }

  start(scene: Phaser.Scene) {
    this.createPanel = new CreateCharacterPanel(scene, this.world);
    this.createPanel.show();
  }

  destroy() {
      this.world.game.scene.remove(CreateCharacterScene.name);
      if (this.createPanel) this.createPanel.destroy();
  }
}
