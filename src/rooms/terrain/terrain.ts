import { TerrainDiaplsy } from "./terrain.display";
import { TerrainManager } from "./terrain.manager";
import { BasicElement } from "../basic/basic.element";

export class Terrain extends BasicElement {
  protected mDisplay: TerrainDiaplsy;
  
  constructor(private mTerrainManager: TerrainManager) {
    super();
  }

  public createDisplay(): TerrainDiaplsy {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    this.mDisplay = new TerrainDiaplsy(null);
    return this.mDisplay;
  }
}