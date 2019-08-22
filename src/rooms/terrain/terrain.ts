import { TerrainDiaplsy } from "./terrain.display";
import { TerrainManager } from "./terrain.manager";
import { BasicElement } from "../basic/basic.element";
import { op_gameconfig, op_client } from "pixelpai_proto";

export class Terrain extends BasicElement {
  protected mDisplay: TerrainDiaplsy | undefined;
  
  constructor(private mTerrainManager: TerrainManager, parent: Phaser.GameObjects.Container) {
    super(parent);
    this.createDisplay();
  }

  public createDisplay(): TerrainDiaplsy | undefined{
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    let scene = this.mTerrainManager.scene;
    if (scene) {
      this.mDisplay = new TerrainDiaplsy(scene);
      this.layer.add(this.mDisplay);
      return this.mDisplay;
    }
  }

  public load(display: op_client.ITerrain) {
    if (this.mDisplay) {
      this.mDisplay.load(display);
    }
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    if (!this.mDisplay) {
      console.error("display is undefine")
      return;
    }
    this.mDisplay.x = x;
    this.mDisplay.y = y;
    this.mDisplay.z = z;
  }
} 