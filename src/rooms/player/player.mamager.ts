import { Player } from "./player";
import { ElementManager } from "../element/element.manager";

export class PlayerManager extends ElementManager{
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  addCharacter() {
    let character = new Player();
  }
}