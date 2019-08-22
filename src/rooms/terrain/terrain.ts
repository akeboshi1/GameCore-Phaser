import { TerrainDiaplsy } from "./terrain.display";
import { TerrainManager } from "./terrain.manager";
import { BasicElement } from "../basic/basic.element";
import { op_gameconfig } from "pixelpai_proto";

export class Terrain extends BasicElement {
  protected mDisplay: TerrainDiaplsy;
  
  constructor(private mTerrainManager: TerrainManager, parent: Phaser.GameObjects.Container) {
    super(parent);
  }

  public createDisplay(): TerrainDiaplsy {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    this.mDisplay = new TerrainDiaplsy(null);
    return this.mDisplay;
  }

  public load(display: op_gameconfig.IDisplay) {
    if (this.mDisplay) {
      this.mDisplay.load(display);
    }
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    if (!!this.mDisplay === false) {
      console.error("display is undefine")
      return;
    }
    this.mDisplay.x = x;
    this.mDisplay.y = y;
    this.mDisplay.z = z;
  }
} 