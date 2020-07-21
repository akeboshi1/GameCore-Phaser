
import { InputText } from "apowophaserui";
import { LabelInput } from "../components/label.input";

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
  constructor(scene: Phaser.Scene, key: string, x?: number, y?: number, dpr: number = 1, scale: number = 1) {
    super(scene, x, y);

    // this.mBackground = new Phaser.GameObjects.Image(this.scene, 0, 0, 200, 144, key, "input_bg", {
    //   left: 50,
    //   top: 48,
    //   right: 50,
    //   bottom: 48
    // });
    this.mBackground = this.scene.make.image({
      key,
      frame: "input_bg"
    }).setScale(scale);

    this.mReduceBtn = this.scene.make.image({
      key,
      frame: "reduce",
    }, false).setInteractive().setScale(scale);
    this.mReduceBtn.x = -(this.mBackground.displayWidth / 2) - this.mReduceBtn.displayWidth / 2 - 7 * dpr * scale;

    this.mIncreaseBtn = this.scene.make.image({
      key,
      frame: "increase",
    }, false).setInteractive().setScale(scale);
    this.mIncreaseBtn.x = (this.mBackground.displayWidth + this.mIncreaseBtn.displayWidth) / 2 + 7 * dpr * scale;
    // this.mInputText = new InputText(this.scene, 0, 0, 200, 80, {
    //   fontSize: "46px",
    //   color: "#666666",
    //   align: "center",
    //   type: "number",
    //   text: 1
    // }).setOrigin(0.5);
    this.mLabelInput = new LabelInput(this.scene, {
      x: 0,
      y: 0,
      width: 160,
      height: 80,
      fontSize: 14 * dpr * scale + "px",
      color: "#666666",
      align: "center",
      type: "number",
    });
    this.mLabelInput.setOrigin(0.5);
    this.mLabelInput.setText("1");
    this.mLabelInput.on("textchange", this.onTextChangeHandler, this);
    this.add([this.mBackground, this.mLabelInput, this.mReduceBtn, this.mIncreaseBtn]);
    this.setSize(this.mIncreaseBtn.displayWidth + this.mReduceBtn.displayWidth + this.mBackground.displayWidth + 14 * dpr * scale, this.mBackground.displayHeight);
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
  }

  setCounter(num: number) {
    if (isNaN(num)) {
      num = 0;
    }
    if (num < this.mMinNum) {
      num = this.mMinNum;
    } else if (num > this.mMaxNum) {
      num = this.mMaxNum;
    }
    this.mLabelInput.setText(num.toString());
    this.emit("change", num);
  }

  setBlur() {
    this.mLabelInput.setBlur();
  }

  get number(): number {
    return parseInt(this.mLabelInput.text, 10);
  }

  private onReduceHandler() {
    let num = parseInt(this.mLabelInput.text, 10);
    this.setCounter(--num);
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
}
