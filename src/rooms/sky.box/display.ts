import { WorldService } from "../../game/world.service";
import { DynamicImage } from "../../ui/components/dynamic.image";
import { Logger } from "../../utils/log";
import { BlockObject } from "../cameras/block.object";

export class BackgroundDisplay {
  private mKey: string;
  private mBlocks: Display[] = [];
  private mInitialized: boolean;
  private mContaienr: Phaser.GameObjects.Container;
  private readonly gridSize;
  private mOffsetX: number;
  private mOffsetY: number;
  private mWCount: number = 1;
  private mHCount: number = 1;
  private mGridWidth: number = 1;
  private mGridHeight: number = 1;
  constructor(private scene: Phaser.Scene, key: string, private world: WorldService) {
    this.mKey = key;
    this.gridSize = 256 * world.uiRatio;
    this.initBlock();
    for (let i = 0; i < this.mBlocks.length; i++) {
      this.mBlocks[i].setIndex(i + 1);
    }
  }

  setScroll(x: number, y: number) {
    const len = this.mBlocks.length;
    const indexW = Math.floor(x / this.mWCount);
    const indexH = Math.floor(y / this.mHCount);
    // for (const block of this.mBlocks) {
    //   block.setIndex(indexW);
    // }
    for (let i = 0; i < len; i++) {
      // const cols =
      this.mBlocks[i].setIndex(indexW + i % indexW + indexW + indexH + Math.floor(i / indexH));
    }
  }

  private initBlock() {
    this.mBlocks = [];
    const camera = this.scene.cameras.main;
    const viewWidth = camera.width * 2;
    const viewHeight = camera.height * 2;
    this.mWCount = Math.ceil(viewWidth / this.gridSize);
    this.mHCount = Math.ceil(viewHeight / this.gridSize);
    if (this.mWCount < 1) this.mWCount = 1;
    if (this.mHCount < 1) this.mHCount = 1;

    if (this.mContaienr) this.mContaienr.removeAll();
    this.mContaienr = this.scene.add.container(0, 0);
    const scaleRatio = this.world.scaleRatio;
    for (let i = 0; i < this.mWCount; i++) {
      for (let j = 0; j < this.mHCount; j++) {
        const item = new Display(this.scene, this.mKey).setOrigin(0);
        item.setScale(scaleRatio);
        item.x = j * this.gridSize;
        item.y = i * this.gridSize;
        this.mBlocks.push(item);
      }
    }
    this.mContaienr.add(this.mBlocks);
  }
}

class Display extends DynamicImage {
  private mIndex: number = -1;
  private mKey: string;
  constructor(scene: Phaser.Scene, key: string) {
    super(scene, 0, 0);
    this.mKey = key;
  }

  setIndex(val: number) {
    if (this.mIndex !== val) {
      this.mIndex = val;
      const key = `${this.mKey}_${val < 10 ? "0" : ""}${val}.png`;
      this.load(key);
    }
  }
}
