import {ITickedObject} from "../../../base/ITickedObject";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {IDisposeObject} from "../../../base/object/interfaces/IDisposeObject";

export class SceneBuffer implements ITickedObject, IDisposeObject {
  public onClear(): void {
  }

  public onDispose(): void {
    this.showBd = null;
    this.memoryBd = null;
    this.terrains = null;
    this.changeAreas = null;
    this.cameraRect = null;
  }
  private showBd: Phaser.BitmapData;
  private memoryBd: Phaser.BitmapData;
  public copyDirty = false;
  public constructor(showBd: Phaser.BitmapData, memoryBd: Phaser.BitmapData) {
    this.showBd = showBd;
    this.memoryBd = memoryBd;
  }

  public onTick(deltaTime: number): void {
    if (this.copyDirty) {
      let boo = true;
      let len = this.terrains.length;
      let terrain: BasicSceneEntity;
      for (let i = 0; i < len; i++) {
        terrain = this.terrains[i];
        if (terrain.drawDirty) {
          boo = false;
          break;
        }
      }
      if (boo) {
        this.copyMemoryRegion(this.changeAreas, this.cameraRect);
        this.copyDirty = false;
      }
    }
  }

  private copyMemoryRegion(changeAreas: Phaser.Rectangle[], cameraRect: Phaser.Rectangle): void {
    let cRect: Phaser.Rectangle;
    let len = changeAreas.length;
    for (let i = 0; i < len; i++) {
      cRect = new Phaser.Rectangle(changeAreas[i].x - cameraRect.x, changeAreas[i].y - cameraRect.y, changeAreas[i].width, changeAreas[i].height);
      this.showBd.copyRect(this.memoryBd, cRect, cRect.x, cRect.y);
    }
  }

  private terrains: BasicSceneEntity[];
  private changeAreas: Phaser.Rectangle[];
  private cameraRect: Phaser.Rectangle;
  public draw(terrains: BasicSceneEntity[], cameraRect: Phaser.Rectangle, changeAreas: Phaser.Rectangle[]): void {
    this.terrains = terrains;
    this.cameraRect = cameraRect;
    this.changeAreas = changeAreas;
    this.copyDirty = true;
  }
}
