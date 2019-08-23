import { PlayerDisplay } from "./playerDragonBones.display";
import { PlayerManager } from "./player.mamager";
import { op_client } from "pixelpai_proto";

export class Player {
  private mPlayerDisplay: PlayerDisplay | undefined;
  protected mLayer: Phaser.GameObjects.Container;

  constructor(private mPlayManager: PlayerManager, parent: Phaser.GameObjects.Container) {
    this.createDisplay();
  }

  public createDisplay(): PlayerDisplay | undefined {
    if (this.mPlayerDisplay) {
      this.mPlayerDisplay.destroy();
    }
    let scene: Phaser.Scene = this.mPlayManager.scene;
    if (scene) {
      this.mPlayerDisplay = new PlayerDisplay(scene);
      this.layer.add(this.mPlayerDisplay);
      return this.mPlayerDisplay;
    }
    return undefined;
  }

  public load(display: op_client.IActor) {
    if (this.mPlayerDisplay) {
      this.mPlayerDisplay.load(display);
    }
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    if (!this.mPlayerDisplay) {
      console.error("display is undefine")
      return;
    }
    this.mPlayerDisplay.x = x;
    this.mPlayerDisplay.y = y;
    this.mPlayerDisplay.z = z;
  }

  public disopse() {
    if (this.mPlayerDisplay) {
      this.mPlayerDisplay.dispose();
      this.mPlayerDisplay = null;
    }
  }

  set layer(layer: Phaser.GameObjects.Container) {
    this.mLayer = layer;
  }

  get layer(): Phaser.GameObjects.Container {
    return this.mLayer;
  }



}