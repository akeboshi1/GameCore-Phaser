import { DynamicImage } from "../../ui/components/dynamic.image";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";

export class BlockManager {
  private mContainer: Phaser.GameObjects.Container;
  private mRows: number = 1;
  private mCols: number = 1;
  private mGridWidth: number;
  private mGridHeight: number;
  private mGrids: Block[];
  private mUris: string[][];
  private mMainCamera: Phaser.Cameras.Scene2D.Camera;
  private mScaleRatio: number;
  constructor(private scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, uris: string[][], private world: WorldService) {
    this.mGrids = [];
    this.mMainCamera = camera;
    this.mUris = uris;
    this.mScaleRatio = this.world.scaleRatio;
  }

  check(time?: number, delta?: number) {
    const worldView = this.mMainCamera.worldView;
    const viewPort = new Phaser.Geom.Rectangle(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2, worldView.width * 2, worldView.height * 2);
    for (const block of this.mGrids) {
      block.checkCamera(Phaser.Geom.Intersects.RectangleToRectangle(viewPort, block.rectangle));
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
    // const len = this.mUris.length * this.mUris[0].length;
    this.mContainer = this.scene.add.container(0, 0);
    this.mContainer.setScale(this.world.scaleRatio);
    // for (let i = 0; i < len; i++) {
    //   const block = new Block(this.scene, this.mKey, i + 1);
    //   block.setRectangle(i % this.mRows * this.mGridWidth, Math.floor(i / this.mRows) * this.mGridHeight, this.mGridWidth, this.mGridHeight, this.mScaleRatio);
    //   this.mGrids[i] = block;
    // }
    const len = this.mUris.length;
    for (let i = 0; i < len; i++) {
      const l = this.mUris[i].length;
      for (let j = 0; j < l; j++) {
        const block = new Block(this.scene, this.mUris[i][j]);
        // block
        this.mGrids.push(block);
      }
    }
    this.mContainer.add(this.mGrids);
  }
}

class Block extends DynamicImage {
  private mLoaded: boolean = false;
  private mInCamera: boolean = false;
  private mKey: string;
  private mRectangle: Phaser.Geom.Rectangle;
  constructor(scene: Phaser.Scene, key: string) {
    super(scene, 0, 0);
    this.mKey = key;
    this.setOrigin(0);
    // this.mRectangle = new Phaser.Geom.Rectangle(this.x, this.y, 1, 1);
  }

  checkCamera(val: boolean) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      if (this.mLoaded) {
        // TODO
        // this.setActive(val);
      } else {
        this.load(this.mKey);
      }
    }
  }

  setRectangle(x: number, y: number, width: number, height: number, scale: number = 1) {
    this.x = x;
    this.y = y;
    // Logger.getInstance().log("=====>>", x, y);
    this.mRectangle = new Phaser.Geom.Rectangle(x * scale, y * scale, width * scale, height * scale);
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
