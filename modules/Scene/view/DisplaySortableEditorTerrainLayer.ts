import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {GameConfig} from "../../../GameConfig";
import Globals from "../../../Globals";
import {SceneBuffer} from "./SceneBuffer";

export class DisplaySortableEditorTerrainLayer extends DisplaySortableSceneLayer {
  protected mStaticContainer: Phaser.Image;
  protected mAnimationContainer: Phaser.Sprite;
  protected showBitmapData: Phaser.BitmapData;
  protected memoryBitmapData: Phaser.BitmapData;
  protected mCameraRect: Phaser.Rectangle;
  protected testGraph: Phaser.Graphics;
  private delEntitys: BasicSceneEntity[];
  private changeEntityRects: Phaser.Rectangle[];
  private sceneBuffer: SceneBuffer;
  private drawMemoryList: BasicSceneEntity[];

  public constructor(game: Phaser.Game) {
    super(game);

    this.delEntitys = [];
    this.changeEntityRects = [];
    this.drawMemoryList = [];

    this.showBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
    this.showBitmapData.smoothed = false;

    this.memoryBitmapData = game.make.bitmapData(GameConfig.GameWidth, GameConfig.GameHeight);
    this.memoryBitmapData.smoothed = false;

    this.sceneBuffer = new SceneBuffer(this.showBitmapData, this.memoryBitmapData);

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

  public onInitialize(): void {
    this.mCameraRect = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);
  }

  public addEntity(d: BasicSceneEntity): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initialize();
    this.mSceneEntities.add(d);

    if (d.isInScreen()) {
      this.drawShowRegion(d, this.mCameraRect);
    }
  }

  public removeEntity(d: BasicSceneEntity, all: boolean = false): void {
    if (!all && d.isInScreen()) {
      this.delEntitys.push(d);
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

    if (d.isInScreen()) {
      if (all) {
        this.drawShowRegion(d, this.mCameraRect);
      } else {
        this.delEntitys.push(d);
        this.changeEntityRects.push(d.getScreenRect());
      }
    }
  }

  public clearShowBitmap(): void {
    this.showBitmapData.cls();
  }

  public onFrame(): void {
    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();

    while (entity) {
      entity.onFrame();
      entity = this.mSceneEntities.moveNext();
    }
    this.sceneBuffer.onFrame();
  }

  public onTick(deltaTime: number): void {
    if (this.sceneBuffer.copyDirty) {
      return;
    }

    let changeDirty = false;
    let drawAreas: Phaser.Rectangle[] = [];
    let offsetX = 0, offsetY = 0;

    let delEntitys: BasicSceneEntity[] = this.delEntitys.splice(0);
    let len = delEntitys.length;
    let dRect: Phaser.Rectangle;
    for (let i = 0; i < len; i++) {
      dRect = delEntitys[i].getRect();
      this.showBitmapData.clear(dRect.x - this.mCameraRect.x, dRect.y - this.mCameraRect.y, dRect.width, dRect.height);
    }

    let changeAreas: Phaser.Rectangle[] = this.changeEntityRects.splice(0);
    len = changeAreas.length;
    if (len > 0) {
      this.mSceneEntities.sort(Globals.Room45Util.sortFunc);
      drawAreas = drawAreas.concat(changeAreas);
      changeDirty = true;
    }

    let newCameraRect: Phaser.Rectangle = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);

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
        let boo = false;
        let reDrawEntitys: BasicSceneEntity[] = [];
        for (let i = 0; i < len; i++) {
          entity = validEntitys[i];
          boo = this.drawMemoryRegion(entity, drawAreas, this.mCameraRect);
          if (boo) {
            reDrawEntitys.push(entity);
          }
        }
        this.sceneBuffer.draw(reDrawEntitys, this.mCameraRect, changeAreas, offsetX, offsetY);
      }
    }
  }

  protected isIntersectionRect(d: BasicSceneEntity, cRects: Phaser.Rectangle[]): boolean {
    let len = cRects.length;
    for (let i = 0; i < len; i++) {
      let dRect = d.getRect();
      let cRect = cRects[i];
      let mRect = Phaser.Rectangle.intersection(dRect, cRect);
      if (mRect.width > 0 && mRect.height > 0) {
        return true;
      }
    }
    return false;
  }

  private drawShowRegion(d: BasicSceneEntity, cameraRect: Phaser.Rectangle): boolean {
    let tx, ty = 0;
    let dRect = d.getRect();
    if (this.isIntersectionRect(d, [cameraRect])) {
      tx = dRect.x - cameraRect.x;
      ty = dRect.y - cameraRect.y;
      d.drawBit(this.showBitmapData, new Phaser.Point(tx, ty));
      return true;
    }
    return false;
  }

  private drawMemoryRegion(d: BasicSceneEntity, cRects: Phaser.Rectangle[], cameraRect: Phaser.Rectangle): boolean {
    let tx, ty = 0;
    let dRect = d.getRect();
    if (this.isIntersectionRect(d, cRects)) {
      tx = dRect.x - cameraRect.x;
      ty = dRect.y - cameraRect.y;
      d.drawBit(this.memoryBitmapData, new Phaser.Point(tx, ty));
      return true;
    }
    return false;
  }

  public onClear(): void {
      this.showBitmapData.cls();
      this.memoryBitmapData.cls();
  }
}
