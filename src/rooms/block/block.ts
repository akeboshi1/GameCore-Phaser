import { Element } from "../element/element";

/**
 * 显示区域
 */
export class Block {
  private mElements: Element[] = [];
  private mInCamera: boolean;
  private mIndex: number;
  constructor(private mRect: Phaser.Geom.Rectangle, index: number) {
    this.mIndex = index;
  }

  public add(element: Element) {
    if (element.block) {
      if (element.block === this) {
        return;
      }
      element.block.remove(element);
    }
    this.mElements.push(element);
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

  get rectangle(): Phaser.Geom.Rectangle | undefined {
    return this.mRect || undefined;
  }
}
