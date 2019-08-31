import { Element } from "../element/element";

/**
 * 显示区域
 */
export class Block {
  private mElements: Element[];
  private mInCamera: boolean;
  constructor(private mRect: Phaser.Geom.Rectangle) {
    this.mElements = [];
  }

  public add(element: Element) {
    if (element.block) {
      element.block.remove(element);
    }
    this.mElements.push(element);
    element.block = this;
  }

  public remove(ele: Element) {
    const index = this.mElements.indexOf(ele);
    if (index !== -1) {
      this.mElements.splice(index, 1);
    }
  }

  public check(viewPort: Phaser.Geom.Rectangle) {
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
