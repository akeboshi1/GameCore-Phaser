import { Font } from "../../utils/font";
import { IButtonState } from "../../../lib/rexui/lib/ui/interface/button/IButtonState";

export class TextButton extends Phaser.GameObjects.Container implements IButtonState {
  private mText: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, dpr: number, scale: number = 1, text?: string, x?: number, y?: number) {
    super(scene, x, y);
    this.mText = this.scene.make.text({
      text,
      style: {
        fontSize: 15 * window.devicePixelRatio,
        fontFamily: Font.DEFULT_FONT
      }
    }, false);
    this.add(this.mText);

    // this.on("pointerup", this.onPointerUpHandler, this);
  }

  setText(val: string) {
    this.mText.text = val;
  }

  setFontSize(size: number) {
    this.mText.setFontSize(size);
  }

  setStyle(style: object) {
    this.mText.setStyle(style);
  }

  changeDown() {
    this.mText.setFill("#0099cc");
  }

  changeNormal() {
    this.mText.setFill("#FFFFFF");
  }

  private onPointerUpHandler(pointer) {
    this.emit("click", pointer, this);
  }

  get text(): Phaser.GameObjects.Text {
    return this.mText;
  }
}
