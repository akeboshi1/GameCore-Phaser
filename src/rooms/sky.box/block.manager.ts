import { DynamicImage } from "../../ui/components/dynamic.image";
import { WorldService } from "../../game/world.service";

export class BlockManager {
  private mContainer: Phaser.GameObjects.Container;
  private mRows: number = 1;
  private mCols: number = 1;
  private mGridWidth: number;
  private mGridHeight: number;
  private mGrids: Block[];
  private mKey: string;
  private mCamera: Phaser.Cameras.Scene2D.Camera;
  private mViewPort: Phaser.Geom.Rectangle;
  private mMainCamera: Phaser.Cameras.Scene2D.Camera;
  constructor(private scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, key: string, private world: WorldService) {
    this.mGrids = [];
    this.mMainCamera = camera;
    this.mKey = key;
  }

  check(time?: number, delta?: number) {
    const worldView = this.mMainCamera.worldView;
    const viewPort = new Phaser.Geom.Rectangle(worldView.x, worldView.y, worldView.width, worldView.height);
    for (const block of this.mGrids) {
      block.checkCamera(Phaser.Geom.Intersects.RectangleToRectangle(viewPort, block.rectangle));
      // block.checkCamera(viewPort.contains(block.x * this.world.scaleRatio, block.y * this.world.scaleRatio));
      // block.checkCamera(true);
    }
  }

  setSize(imageW: number, imageH: number, gridW?: number, gridH?: number) {
    if (gridW === undefined) gridW = imageW;
    if (gridH === undefined) gridH = imageH;
    this.mRows = Math.ceil(imageW / gridW);
    this.mCols = Math.ceil(imageH / gridH);
    this.mGridWidth = gridW;
    this.mGridHeight = gridH;
    this.initBlock();
  }

  destroy() {
    for (const grid of this.mGrids) {
      grid.destroy();
    }
  }

  private initBlock() {
    this.mGrids.length = 0;
    this.mViewPort = new Phaser.Geom.Rectangle();
    const len = this.mRows * this.mCols;
    this.mContainer = this.scene.add.container(0, 0);
    this.mContainer.setScale(this.world.scaleRatio);
    for (let i = 0; i < len; i++) {
      const block = new Block(this.scene, this.mKey, i + 1);
      block.setRectangle(i % this.mRows * this.mGridWidth, Math.floor(i / this.mRows) * this.mGridHeight, this.mGridWidth * this.world.scaleRatio, this.mGridHeight * this.world.scaleRatio);
      this.mGrids[i] = block;
    }
    this.mContainer.add(this.mGrids);
  }
}

class Block extends DynamicImage {
  private mLoaded: boolean = false;
  private mInCamera: boolean = false;
  private mKey: string;
  private readonly mIndex: number = 0;
  private mRectangle: Phaser.Geom.Rectangle;
  constructor(scene: Phaser.Scene, key: string, index: number) {
    super(scene, 0, 0);
    this.mKey = key;
    this.mIndex = index;
    this.setOrigin(0);
    this.mRectangle = new Phaser.Geom.Rectangle(this.x, this.y, 1, 1);
  }

  checkCamera(val: boolean) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      if (this.mLoaded) {
        // TODO
        // this.setActive(val);
      } else {
        this.load(`${this.mKey}_${this.mIndex < 10 ? "0" : ""}${this.mIndex}.png`);
      }
    }
  }

  setRectangle(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.mRectangle = new Phaser.Geom.Rectangle(x * this.originX, y * this.originY, width, height);
  }

  get rectangle(): Phaser.Geom.Rectangle {
    return this.mRectangle;
  }

  protected onLoadComplete(file) {
    super.onLoadComplete(file);
    if (this.texture) {
      this.mLoaded = true;
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.mRectangle.setSize(this.width, this.height);
    }
  }
}
