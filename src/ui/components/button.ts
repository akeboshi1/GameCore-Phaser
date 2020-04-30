import { GameObjects } from "phaser";
import { IButtonState } from "./interface/IButtonState";

export class Button extends GameObjects.Container implements IButtonState {
  protected mBackground: Phaser.GameObjects.Image;
  protected mPressDelay = 1000;
  protected mPressTime: any;
  protected mKey: string;
  protected mFrame: string;
  protected mDownFrame: string;
  protected mText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, key: string, frame?: string, downFrame?: string, text?: string) {
    super(scene);
    this.mKey = key;
    this.mFrame = frame;
    this.mDownFrame = downFrame;
    this.mBackground = scene.make.image({
      key,
      frame
    }, false);
    this.setSize(this.mBackground.width, this.mBackground.height);
    this.add(this.mBackground);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
    if (text) {
      this.mText = this.scene.make.text(undefined, false)
        .setOrigin(0.5, 0.5)
        .setText(text)
        .setSize(this.mBackground.width, this.mBackground.height);
      this.add(this.mText);
    }
    this.on("pointerup", this.onPointerUpHandler, this);
    this.on("pointerdown", this.onPointerDownHandler, this);
  }

  changeNormal() {
    this.mBackground.setFrame(this.mFrame);
  }

  changeDown() {
    if (this.mDownFrame) {
      this.mBackground.setFrame(this.mDownFrame);
    }
  }

  setFrame(frame: string) {
    if (this.mBackground) {
      this.mBackground.setFrame(frame);
    }
  }

  setText(val: string) {
    if (this.mText) {
      this.mText.setText(val);
    }
  }

  setTextStyle(style: object) {
    if (this.mText) {
      this.mText.setStyle(style);
    }
  }

  setFontStyle(val: string) {
    if (this.mText) {
      this.mText.setFontStyle(val);
    }
  }

  setTextOffset(x: number, y: number) {
    if (this.mText) {
      this.mText.setPosition(x, y);
    }
  }

  setTextColor(color: string) {
    if (this.mText) {
      this.mText.setColor(color);
    }
  }

  destroy() {
    this.off("pointerup", this.onPointerUpHandler, this);
    this.off("pointerdown", this.onPointerDownHandler, this);
    super.destroy();
  }

  private onPointerUpHandler(pointer: Phaser.Input.Pointer) {
    if (Math.abs(pointer.downX - pointer.upX) < 30 && Math.abs(pointer.downY - pointer.upY) < 30) {
      this.emit("click", pointer, this);
    }
    clearTimeout(this.mPressTime);
  }

  private onPointerDownHandler() {
    this.mPressTime = setTimeout(() => {
      this.emit("hold", this);
    }, this.mPressDelay);
  }
}
