import {ITickedObject} from "../../../base/ITickedObject";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {Tick} from "../../../common/tick/Tick";
import {IDisposeObject} from "../../../base/object/interfaces/IDisposeObject";

export class SceneBuffer implements ITickedObject, IDisposeObject {
  public onClear(): void {
  }

  public onDispose(): void {
    if (this.mTick) {
      this.mTick.onDispose();
    }
    this.mTick = null;
    this.showBd = null;
    this.memoryBd = null;
    this.terrains = null;
    this.changeAreas = null;
    this.cameraRect = null;
  }
  private showBd: Phaser.BitmapData;
  private memoryBd: Phaser.BitmapData;
  public copyDirty = false;
  private mTick: Tick;
  public constructor(showBd: Phaser.BitmapData, memoryBd: Phaser.BitmapData) {
    this.showBd = showBd;
    this.memoryBd = memoryBd;
    this.mTick = new Tick(60);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.start();
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
        this.copyMemoryRegion(this.changeAreas, this.cameraRect, this.offsetX, this.offsetY);
        this.copyDirty = false;
      }
    }
  }

  private copyMemoryRegion(changeAreas: Phaser.Rectangle[], cameraRect: Phaser.Rectangle, offsetX: number, offsetY: number): void {
    this.showBd.move(offsetX, offsetY, false);

    let cRect: Phaser.Rectangle;
    if (offsetX !== 0) {
      if (offsetX < 0) {
        cRect = new Phaser.Rectangle(cameraRect.width + offsetX, 0, -offsetX, cameraRect.height);
        this.showBd.copyRect(this.memoryBd, cRect, cameraRect.width + offsetX, 0);
      } else {
        cRect = new Phaser.Rectangle(0, 0, offsetX, cameraRect.height);
        this.showBd.copyRect(this.memoryBd, cRect, 0, 0);
      }
    }

    if (offsetY !== 0) {
      if (offsetY < 0) {
        cRect = new Phaser.Rectangle(0, cameraRect.height + offsetY, cameraRect.width, -offsetY);
        this.showBd.copyRect(this.memoryBd, cRect, 0, cameraRect.height + offsetY);
      } else {
        cRect = new Phaser.Rectangle(0, 0, cameraRect.width, offsetY);
        this.showBd.copyRect(this.memoryBd, cRect, 0, 0);
      }
    }

    let len = changeAreas.length;
    for (let i = 0; i < len; i++) {
      cRect = new Phaser.Rectangle(changeAreas[i].x - cameraRect.x, changeAreas[i].y - cameraRect.y, changeAreas[i].width, changeAreas[i].height);
      this.showBd.copyRect(this.memoryBd, cRect, cRect.x, cRect.y);
    }
  }

  private terrains: BasicSceneEntity[];
  private changeAreas: Phaser.Rectangle[];
  private cameraRect: Phaser.Rectangle;
  private offsetX: number;
  private offsetY: number;
  public draw(terrains: BasicSceneEntity[], cameraRect: Phaser.Rectangle, changeAreas: Phaser.Rectangle[], offsetX: number, offsetY: number): void {
      this.terrains = terrains;
      this.cameraRect = cameraRect;
      this.changeAreas = changeAreas;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.copyDirty = true;
  }
}
