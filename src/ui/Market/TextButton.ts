import { IButtonState } from "../components/interface/IButtonState";
import { Font } from "../../utils/font";

export class TextButton extends Phaser.GameObjects.Container implements IButtonState {
  private text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, text?: string, x?: number, y?: number) {
    super(scene, x, y);
    this.text = this.scene.make.text({
      text,
      style: {
        fontSize: "42px",
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5);
    this.add(this.text);

    this.on("pointerup", this.onPointerUpHandler, this);
  }

  setText(val: string) {
    this.text.text = val;
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

  setSize(w: number, h: number) {
    super.setSize(w, h);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    // this.text.setInteractive(new Phaser.Geom.Rectangle(w >> 1, h >> 1, w, h), Phaser.Geom.Rectangle.Contains);
    return this;
  }

  private onPointerUpHandler(pointer) {
    this.emit("click", pointer, this);
  }
}
