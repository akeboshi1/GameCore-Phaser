import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatch } from "../components/nine.patch";
import { LabelInput } from "../components/label.input";

export class NumberCounter extends Phaser.GameObjects.Container {
  private mBackground: NinePatch;
  private mReduceBtn: Phaser.GameObjects.Image;
  private mIncreaseBtn: Phaser.GameObjects.Image;
  private mInputText: InputText;
  private mLabelInput: LabelInput;
  private readonly pressDelay = 500;
  private pressTimeout: any;
  private tween: Phaser.Tweens.Tween;
  private mMinNum: number = 1;
  private mMaxNum: number = 99;
  constructor(scene: Phaser.Scene, key: string, x?: number, y?: number) {
    super(scene, x, y);

    this.mBackground = new NinePatch(this.scene, 0, 0, 200, 100, key, "input_bg.png", {
      left: 50,
      top: 48,
      right: 50,
      bottom: 48
    });

    this.mReduceBtn = this.scene.make.image({
      key,
      frame: "reduce.png",
      x: this.mBackground.x - (this.mBackground.width >> 1) - 60
    }, false).setInteractive();

    this.mIncreaseBtn = this.scene.make.image({
      key,
      frame: "increase.png",
      x: this.mBackground.x + (this.mBackground.width >> 1) + 60
    }, false).setInteractive();

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
      fontSize: "46px",
      color: "#666666",
      align: "center",
      type: "number",
    });
    this.mLabelInput.setOrigin(0.5);
    this.mLabelInput.setText("1");
    this.mLabelInput.on("textchange", this.onTextChangeHandler, this);
    this.add([this.mBackground, this.mLabelInput, this.mReduceBtn, this.mIncreaseBtn]);
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
  }

  private onIncreaseDownHandler() {
    this.pressTimeout = setTimeout(() => {
      this.delayTweenNumber(this.mMaxNum);
    }, this.pressDelay);
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
