import { IButtonState } from "../components/interface/IButtonState";
import { Font } from "../../utils/font";

export class TextButton extends Phaser.GameObjects.Container implements IButtonState {
  private text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, dpr: number, scale: number = 1, text?: string, x?: number, y?: number) {
    super(scene, x, y);
    this.text = this.scene.make.text({
      text,
      style: {
        fontSize: 15 * window.devicePixelRatio,
        fontFamily: Font.DEFULT_FONT
      }
    }, false);
    this.add(this.text);

    // this.on("pointerup", this.onPointerUpHandler, this);
  }

  setText(val: string) {
    this.text.text = val;
  }

  setFontSize(size: number) {
    this.text.setFontSize(size);
  }

  setStyle(style: object) {
    this.text.setStyle(style);
  }

  changeDown() {
    this.text.setFill("#0099cc");
  }

  changeNormal() {
    this.text.setFill("#FFFFFF");
  }

  private onPointerUpHandler(pointer) {
    this.emit("click", pointer, this);
  }
}
