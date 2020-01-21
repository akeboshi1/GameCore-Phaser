import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatch } from "../components/nine.patch";

export class NumberCounter extends Phaser.GameObjects.Container {
  private mBackground: NinePatch;
  private mReduceBtn: Phaser.GameObjects.Image;
  private mIncreaseBtn: Phaser.GameObjects.Image;
  private mInputText: InputText;
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

    this.mInputText = new InputText(this.scene, 0, 0, 200, 80, {
      fontSize: "46px",
      color: "#666666",
      align: "center",
      type: "number",
      text: 1
    }).setOrigin(0.5);
    this.add([this.mBackground, this.mInputText, this.mReduceBtn, this.mIncreaseBtn]);
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
    this.mReduceBtn.on("pointerup", this.onReduceHandler, this);
  }

  removeActionListener() {
    this.mIncreaseBtn.off("pointerup", this.onIncreaseHandler, this);
    this.mReduceBtn.off("pointerup", this.onReduceHandler, this);
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
    this.mInputText.text = num;
    this.emit("change", num);
  }

  get number(): number {
    return parseInt(this.mInputText.text, 10);
  }

  private onReduceHandler() {
    let num = parseInt(this.mInputText.text, 10);
    this.setCounter(--num);
  }

  private onIncreaseHandler() {
    let num = parseInt(this.mInputText.text, 10);
    this.setCounter(++num);
  }
}
