import { ElementManager } from "./gameobject/element/element.manager";
import { PlayerManager } from "./gameobject/player/player.mamager";

export class RoomManager {
  protected mElementManager: ElementManager;
  protected mPlayerManager: PlayerManager;

  constructor(private mScene: Phaser.Scene) {
    this.initialize();
  }

  private initialize() {
    this.mElementManager = new ElementManager(this.mScene);
    this.mPlayerManager = new PlayerManager(this.mScene);
  }
}