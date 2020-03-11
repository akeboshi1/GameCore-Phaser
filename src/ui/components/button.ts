import { GameObjects } from "phaser";
import { IButtonState } from "./interface/IButtonState";

export class Button extends GameObjects.Container implements IButtonState {
  private mBackground: Phaser.GameObjects.Image;
  private mPressDelay = 1000;
  private mPressTime: any;
  private mKey: string;
  private mFrame: string;
  private mDownFrame: string;
  private mText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, key: string, frame?: string, downFrame?: string, text?: string) {
    super(scene);
    this.mKey = key;
    this.mFrame = frame;
    this.mDownFrame = downFrame;
    this.mBackground = scene.make.image({
      key,
      frame
    }, false).setInteractive();
    this.setSize(this.mBackground.width, this.mBackground.height);
    this.add(this.mBackground);

    if (text) {
      this.mText = this.scene.make.text(undefined, false)
        .setOrigin(0.5, 0.5)
        .setText(text)
        .setSize(this.mBackground.width, this.mBackground.height);
      this.add(this.mText);
    }
    this.mBackground.on("pointerup", this.onPointerUpHandler, this);
    this.mBackground.on("pointerdown", this.onPointerDownHandler, this);
  }

  changeNormal() {
    this.mBackground.setFrame(this.mFrame);
  }

  changeDown() {
    if (this.mDownFrame) {
      this.mBackground.setFrame(this.mDownFrame);
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
