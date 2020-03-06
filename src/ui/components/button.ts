import { GameObjects } from "phaser";
import { IButtonState } from "./interface/IButtonState";

export class Button extends GameObjects.Container implements IButtonState {
  private mBackground: Phaser.GameObjects.Image;
  private mPressDelay = 1000;
  private mPressTime: any;

  constructor(scene: Phaser.Scene, key: string, frame?: string) {
    super(scene);
    this.mBackground = scene.make.image({
      key,
      frame
    }, false).setInteractive();
    this.setSize(this.mBackground.width, this.mBackground.height);
    this.add(this.mBackground);
    this.mBackground.on("pointerup", this.onPointerUpHandler, this);
    this.mBackground.on("pointerdown", this.onPointerDownHandler, this);
  }

  changeNormal() {
  }

  changeDown() {
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
