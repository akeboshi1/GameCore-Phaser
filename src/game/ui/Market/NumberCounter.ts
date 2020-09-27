import { LabelInput } from "../components/label.input";
import { InputText } from "apowophaserui";

export class NumberCounter extends Phaser.GameObjects.Container {
  private mBackground: Phaser.GameObjects.Image;
  private mReduceBtn: Phaser.GameObjects.Image;
  private mIncreaseBtn: Phaser.GameObjects.Image;
  private mInputText: InputText;
  private mLabelInput: LabelInput;
  private readonly pressDelay = 500;
  private pressTimeout: any;
  private tween: Phaser.Tweens.Tween;
  private mMinNum: number = 1;
  private mMaxNum: number = 99;
  private zoom: number = 1;
  private mRectangle: Phaser.Geom.Rectangle;
  constructor(scene: Phaser.Scene, key: string, x?: number, y?: number, dpr: number = 1, zoom: number = 1) {
    super(scene, x, y);
    this.zoom = zoom;
    this.mBackground = this.scene.make.image({
      key,
      frame: "input_bg"
    });
    this.mBackground.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mReduceBtn = this.scene.make.image({
      key,
      frame: "reduce",
    }, false).setInteractive();
    this.mReduceBtn.x = -(this.mBackground.displayWidth / 2) - this.mReduceBtn.displayWidth / 2 - 7 * dpr;
    this.mReduceBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mIncreaseBtn = this.scene.make.image({
      key,
      frame: "increase",
    }, false).setInteractive();
    this.mIncreaseBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mIncreaseBtn.x = (this.mBackground.displayWidth + this.mIncreaseBtn.displayWidth) / 2 + 7 * dpr;
    this.mLabelInput = new LabelInput(this.scene, {
      x: 0,
      y: 0,
      width: this.mBackground.height,
      height: 26 * dpr,
      fontSize: 14 * dpr + "px",
      color: "#666666",
      align: "center",
      type: "number",
    });
    this.mLabelInput.setOrigin(0.5);
    this.mLabelInput.setText("1");
    this.mLabelInput.on("textchange", this.onTextChangeHandler, this);
    this.mLabelInput.on("blur", this.onTextBlurHandler, this);
    this.mLabelInput.on("focus", this.onFocusHandler, this);
    this.add([this.mBackground, this.mLabelInput, this.mReduceBtn, this.mIncreaseBtn]);
    this.setSize(this.mIncreaseBtn.displayWidth + this.mReduceBtn.displayWidth + this.mBackground.displayWidth + 14 * dpr, this.mBackground.displayHeight);
  }

  resize() {
  }

  setMinNumber(val: number) {
    this.mMinNum = val;
  }

  setMaxNumber(val: number) {
    this.mMaxNum = val;
  }

  addActionListener() {
    this.mIncreaseBtn.on("pointerup", this.onIncreaseHandler, this);
    this.mIncreaseBtn.on("pointerdown", this.onIncreaseDownHandler, this);
    this.mReduceBtn.on("pointerup", this.onReduceHandler, this);
    this.mReduceBtn.on("pointerdown", this.onReduceDownHandler, this);
  }

  removeActionListener() {
    this.mIncreaseBtn.off("pointerup", this.onIncreaseHandler, this);
    this.mIncreaseBtn.off("pointerdown", this.onIncreaseDownHandler, this);
    this.mReduceBtn.off("pointerup", this.onReduceHandler, this);
    this.mReduceBtn.off("pointerdown", this.onReduceDownHandler, this);
    this.scene.input.off("pointerdown", this.pointerDownHandler, this);
  }

  setCounter(num: number) {
    if (isNaN(num) || num < 0) {
      num = 0;
    }
    if (num > this.mMaxNum) {
      num = this.mMaxNum;
    }
    this.mLabelInput.setText(num.toString());
    this.emit("change", num);
  }

  setBlur() {
    this.mLabelInput.setBlur();
  }

  destroy() {
    this.removeActionListener();
    super.destroy();
  }

  get number(): number {
    return parseInt(this.mLabelInput.text, 10);
  }

  private onReduceHandler() {
    let num = parseInt(this.mLabelInput.text, 10);
    num--;
    if (num < this.mMinNum) num = this.mMinNum;
    this.setCounter(num);
    this.clearTween();
  }

  private onIncreaseHandler() {
    let num = parseInt(this.mLabelInput.text, 10);
    this.setCounter(++num);
    this.clearTween();
  }

  private onTextChangeHandler() {
    this.setCounter(parseInt(this.mLabelInput.text, 10));
  }

  private onTextBlurHandler() {
    let num = parseInt(this.mLabelInput.text, 0);
    if (num < this.mMinNum) {
      num = this.mMinNum;
    } else if (num > this.mMaxNum) {
      num = this.mMaxNum;
    }
    this.mLabelInput.setText(num.toString());
    this.emit("change", num);
    this.scene.input.off("pointerdown", this.pointerDownHandler, this);
  }

  private onReduceDownHandler() {
    this.pressTimeout = setTimeout(() => {
      this.delayTweenNumber(this.mMinNum);
    }, this.pressDelay);
    this.setBlur();
  }

  private onIncreaseDownHandler() {
    this.pressTimeout = setTimeout(() => {
      this.delayTweenNumber(this.mMaxNum);
    }, this.pressDelay);
    this.setBlur();
  }

  private delayTweenNumber(to: number) {
    const number = this.number;
    this.tween = this.scene.tweens.addCounter({
      from: number,
      to,
      onUpdate: () => {
        this.setCounter(this.tween.getValue() >> 0);
      },
      duration: Math.abs(number - to) * 50
    });
  }

  private clearTween() {
    clearTimeout(this.pressTimeout);
    if (this.tween) {
      this.tween.stop();
      this.tween = undefined;
    }
  }
  private pointerDownHandler(pointer: Phaser.Input.Pointer) {
    if (!this.checkPointerInBounds(this, pointer)) {
      this.mLabelInput.setBlur();
    }
  }

  private onFocusHandler() {
    this.scene.input.on("pointerdown", this.pointerDownHandler, this);
  }

  private checkPointerInBounds(gameObject: any, pointer: Phaser.Input.Pointer, isCell: Boolean = false): boolean {
    if (!this.mRectangle) {
      this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    }
    const zoom = this.zoom ? this.zoom : 1;
    this.mRectangle.left = -gameObject.width / 2;
    this.mRectangle.right = gameObject.width / 2;
    this.mRectangle.top = -gameObject.height / 2;
    this.mRectangle.bottom = gameObject.height / 2;
    if (pointer) {
      const worldMatrix: Phaser.GameObjects.Components.TransformMatrix = gameObject.getWorldTransformMatrix();
      const x: number = (pointer.x - worldMatrix.tx) / zoom;
      const y: number = (pointer.y - worldMatrix.ty) / zoom;
      if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
        return true;
      }
      return false;
    }
    return false;
  }
}
