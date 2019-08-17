import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";

export class RoomManager {
  protected mElementManager: ElementManager;
  protected mPlayerManager: PlayerManager;

  constructor(private mScene: Phaser.Scene) {
    this.mElementManager = new ElementManager(this.mScene);
    this.mPlayerManager = new PlayerManager(this.mScene);
  }

  private initialize() {
    
  }
}