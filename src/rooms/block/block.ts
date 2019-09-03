import { Element } from "../element/element";
import { Console } from "../../utils/log";

/**
 * 显示区域
 */
export class Block {
  private mElements: Element[] = [];
  private mInCamera: boolean;
  private mIndex: number;
  private mDebug: boolean;
  constructor(private mRect: Phaser.Geom.Rectangle, index: number, debug?: boolean) {
    this.mIndex = index;
    this.mDebug = debug;
  }

  public add(element: Element) {
    if (element.block) {
      if (element.block === this) {
        return;
      }
      element.block.remove(element);
    }
    this.mElements.push(element);
    if (this.mInCamera) {
      Console.log("==============");
    }
    element.inCamera = this.mInCamera;
    element.block = this;
  }

  public remove(ele: Element) {
    const index = this.mElements.indexOf(ele);
    if (index !== -1) {
      this.mElements.splice(index, 1);
    }
  }

  public check(viewPort: Phaser.Geom.Rectangle) {
    if (!viewPort) return;
    if (Phaser.Geom.Intersects.RectangleToRectangle(viewPort, this.rectangle)) {
      this.inCamera = true;
    } else {
      this.inCamera = false;
    }
  }

  public drawBoard(scene: Phaser.Scene) {
    if (!scene) {
      throw new Error("wrong scene");
    }
    const graphics = scene.make.graphics(undefined, false);
    graphics.lineStyle(5, 0xFF, 1);
    graphics.strokeRect(this.mRect.x, this.mRect.y, this.mRect.width, this.mRect.height);
    return graphics;
  }

  private addDisplay() {
    for (const ele of this.mElements) {
      ele.addDisplay();
    }
  }

  private removeDisplay() {
    for (const ele of this.mElements) {
      ele.removeDisplay();
    }
  }

  set inCamera(val) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      if (this.mInCamera) {
        this.addDisplay();
      } else {
        this.removeDisplay();
      }
    }
  }

  get inCamera(): boolean {
    return this.mInCamera;
  }

  get rectangle(): Phaser.Geom.Rectangle | undefined {
    return this.mRect || undefined;
  }
}
