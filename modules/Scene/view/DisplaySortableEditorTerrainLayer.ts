import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {GameConfig} from "../../../GameConfig";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import Globals from "../../../Globals";

export class DisplaySortableEditorTerrainLayer extends DisplaySortableSceneLayer {
  protected mStaticContainer: Phaser.Image;
  protected mAnimationContainer: Phaser.Sprite;
  protected showBitmapData: Phaser.BitmapData;
  protected memoryBitmapData: Phaser.BitmapData;
  protected mCameraRect: Phaser.Rectangle;
  protected testGraph: Phaser.Graphics;
  private drawFlag = false;
  private changeEntityRects: Phaser.Rectangle[];

  public constructor(game: Phaser.Game) {
    super(game);

    this.changeEntityRects = [];

    this.showBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
    this.showBitmapData.smoothed = false;

    this.memoryBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
    this.memoryBitmapData.smoothed = false;

    this.mStaticContainer = this.game.make.image(0, 0, this.showBitmapData);
    this.mStaticContainer.fixedToCamera = true;
    this.mStaticContainer.cacheAsBitmap = true;
    this.add(this.mStaticContainer);

    this.mAnimationContainer = this.game.make.sprite(0, 0);
    this.add(this.mAnimationContainer);

    this.testGraph = this.game.make.graphics();
    this.testGraph.fixedToCamera = true;
    this.add(this.testGraph);
  }

  public addEntity(d: BasicSceneEntity): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initialize();
    this.mSceneEntities.add(d);

    if (d.isInScreen()) {
      d.drawBack(this.drawShowRegion, this, this.mCameraRect);
    }
  }


  public removeEntity(d: BasicSceneEntity, all: boolean = false): void {
    if (!all && d.isInScreen()) {
      this.clearShowRegion(d);
      this.changeEntityRects.push(d.getScreenRect());
    }

    this.mSceneEntities.remove(d);
    d.scene = null;
    d.camera = null;
    d.onClear();
  }

  public insertEntity(d: BasicSceneEntity, all: boolean = false): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initialize();
    this.mSceneEntities.add(d);

    if (!all && d.isInScreen()) {
      this.changeEntityRects.push(d.getScreenRect());
    }
  }

  public fillEntityEnd(): void {
    this.changeEntityRects.push(this.mCameraRect);
  }

  public onFrame(): void {

    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();

    while (entity) {
      entity.onFrame();
      entity = this.mSceneEntities.moveNext();
    }
  }

  public onTick(deltaTime: number): void {

    if (this.drawFlag) {
      return;
    }

    let changeDirty = false;
    let drawAreas: Phaser.Rectangle[] = [];
    let offsetX = 0, offsetY = 0;

    let changeAreas: Phaser.Rectangle[] = this.changeEntityRects.splice(0);
    let len = changeAreas.length;
    if (len > 0) {
      this.mSceneEntities.sort(Globals.Room45Util.sortFunc);
      drawAreas = drawAreas.concat(changeAreas);
      changeDirty = true;
    }

    let newCameraRect: Phaser.Rectangle = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);

    if (this.mCameraRect === undefined) {
      this.mCameraRect = new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, newCameraRect.width, newCameraRect.height);
    }

    if (!Phaser.Rectangle.equals(newCameraRect, this.mCameraRect)) {
      changeDirty = true;

      offsetX = (this.mCameraRect.x - newCameraRect.x);
      offsetY = (this.mCameraRect.y - newCameraRect.y);

      if (offsetX !== 0 && offsetY !== 0) {
        if (offsetX < 0 && offsetY < 0) {
          drawAreas.push(new Phaser.Rectangle(newCameraRect.right + offsetX, newCameraRect.y, -offsetX, newCameraRect.height));
          drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.bottom + offsetY, newCameraRect.width + offsetX, -offsetY));
        } else if (offsetX > 0 && offsetY > 0) {
          drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, offsetX, newCameraRect.height));
          drawAreas.push(new Phaser.Rectangle(newCameraRect.x + offsetX, newCameraRect.y, newCameraRect.width - offsetX, offsetY));
        } else if (offsetX < 0 && offsetY > 0) {
          drawAreas.push(new Phaser.Rectangle(newCameraRect.right + offsetX, newCameraRect.y, -offsetX, newCameraRect.height));
          drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, newCameraRect.width - offsetX, offsetY));
        } else if (offsetX > 0 && offsetY < 0) {
          drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, offsetX, newCameraRect.height));
          drawAreas.push(new Phaser.Rectangle(newCameraRect.x + offsetX, newCameraRect.bottom + offsetY, newCameraRect.width - offsetX, -offsetY));
        }
      } else {
        if (offsetX !== 0) {
          if (offsetX < 0) {
            drawAreas.push(new Phaser.Rectangle(newCameraRect.right + offsetX, newCameraRect.y, -offsetX, newCameraRect.height));
          } else {
            drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, offsetX, newCameraRect.height));
          }
        }
        if (offsetY !== 0) {
          if (offsetY < 0) {
            drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.bottom + offsetY, newCameraRect.width, -offsetY));
          } else {
            drawAreas.push(new Phaser.Rectangle(newCameraRect.x, newCameraRect.y, newCameraRect.width, offsetY));
          }
        }
      }
      this.mCameraRect.setTo(newCameraRect.x, newCameraRect.y, newCameraRect.width, newCameraRect.height);
    }

    let validEntitys: BasicSceneEntity[] = [];
    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
    while (entity) {
      entity.onTick(deltaTime);
      if (changeDirty && entity.isValidDisplay) {
        validEntitys.push(entity);
      }
      entity = this.mSceneEntities.moveNext();
    }

    if (changeDirty) {
      len = validEntitys.length;
      if (len > 0) {
        this.memoryBitmapData.cls();
        this.drawFlag = true;
        let last = false;
        for (let i = 0; i < len; i++) {
          entity = validEntitys[i];
          last = (i === len - 1);
          // entity.drawBack(this.drawMemoryRegion, this, drawAreas, this.mCameraRect, offsetX, offsetY, changeAreas);
          this.pushDrawMemory(entity, this.drawMemoryRegion, this, drawAreas, this.mCameraRect, offsetX, offsetY, changeAreas, last);
        }
      }
    }
  }

  private drawShowRegion(d: BasicSceneEntity, cameraRect: Phaser.Rectangle): void {
    let loader: DisplayLoaderAvatar = d.display.Loader;
    let tx, ty = 0;
    let dRect = d.getRect();
    let mRect = Phaser.Rectangle.intersection(dRect, cameraRect);

    if (mRect.width > 0 && mRect.height > 0) {
      tx = dRect.x - cameraRect.x;
      ty = dRect.y - cameraRect.y;
      this.showBitmapData.draw(loader, tx, ty);
    }
  }

  private clearShowRegion(d: BasicSceneEntity): void {
    let dRect = d.getRect();
    this.showBitmapData.clear(dRect.x - this.mCameraRect.x, dRect.y - this.mCameraRect.y, dRect.width, dRect.height);
  }

  private drawMemoryList = [];
  private drawMemoryIng = false;
  private pushDrawMemory(d: BasicSceneEntity, ... param: any[]): void {
    this.drawMemoryList.push({entity: d, param: param});
    this.onDrawMemory();
  }

  private onDrawMemory(): void {
    if (this.drawMemoryIng || this.drawMemoryList.length === 0) {
      return;
    }
    this.drawMemoryIng = true;
    let obj = this.drawMemoryList.shift();
    let entity = obj.entity;
    let param = obj.param;
    entity.drawBack.apply(entity, param);
  }

  private onDrawComplete(): void {
    this.drawMemoryIng = false;
    this.onDrawMemory();
  }

  private drawMemoryRegion(d: BasicSceneEntity, cRects: Phaser.Rectangle[], cameraRect: Phaser.Rectangle, offsetX: number, offsetY: number, changeAreas: Phaser.Rectangle[], last: boolean): void {
    let len = cRects.length;
    let loader: DisplayLoaderAvatar = d.display.Loader;
    let tx, ty = 0;
    for (let i = 0; i < len; i++) {
      let dRect = d.getRect();
      let cRect = cRects[i];
      let mRect = Phaser.Rectangle.intersection(dRect, cRect);
      if (mRect.width > 0 && mRect.height > 0) {
        tx = dRect.x - cameraRect.x;
        ty = dRect.y - cameraRect.y;
        this.memoryBitmapData.draw(loader, tx, ty);
      }
    }
    this.onDrawComplete();
    if (last) {
      this.showBitmapData.move(offsetX, offsetY, false);
      let cRect: Phaser.Rectangle;
      if (offsetX !== 0) {
        if (offsetX < 0) {
          cRect = new Phaser.Rectangle(cameraRect.width + offsetX, 0, -offsetX, cameraRect.height);
          this.showBitmapData.copyRect(this.memoryBitmapData, cRect, cameraRect.width + offsetX, 0);
        } else {
          cRect = new Phaser.Rectangle(0, 0, offsetX, cameraRect.height);
          this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, 0);
        }
      }

      if (offsetY !== 0) {
        if (offsetY < 0) {
          cRect = new Phaser.Rectangle(0, cameraRect.height + offsetY, cameraRect.width, -offsetY);
          this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, cameraRect.height + offsetY);
        } else {
          cRect = new Phaser.Rectangle(0, 0, cameraRect.width, offsetY);
          this.showBitmapData.copyRect(this.memoryBitmapData, cRect, 0, 0);
        }
      }
      len = changeAreas.length;
      for (let i = 0; i < len; i++) {
        cRect = new Phaser.Rectangle(changeAreas[i].x - cameraRect.x, changeAreas[i].y - cameraRect.y, changeAreas[i].width, changeAreas[i].height);
        this.showBitmapData.copyRect(this.memoryBitmapData, cRect, cRect.x, cRect.y);
      }
      this.drawFlag = false;
    }
  }
}
