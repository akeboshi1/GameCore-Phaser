import { Font } from "../../../../utils/font";

export class TextButton extends Phaser.GameObjects.Container {
  private mText: Phaser.GameObjects.Text;
  private normalColor: string = "#FFFFFF";
  private changeColor: string = "#0099cc";
  constructor(scene: Phaser.Scene, dpr: number, scale: number = 1, text?: string, x?: number, y?: number) {
    super(scene, x, y);
    this.mText = this.scene.make.text({
      text,
      style: {
        fontSize: 15 * window.devicePixelRatio,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5, 0.5);
    this.add(this.mText);
    // this.on("pointerup", this.onPointerUpHandler, this);
  }

  setText(val: string) {
    this.mText.text = val;
  }

  setFontSize(size: number) {
    this.mText.setFontSize(size);
  }
  setFontStyle(val: string) {
    this.mText.setFontStyle(val);
  }

  setStyle(style: object) {
    this.mText.setStyle(style);
  }

  setNormalColor(color: string) {
    this.normalColor = color;
  }

  setChangeColor(color: string) {
    this.changeColor = color;
  }

  changeDown() {
    this.mText.setFill(this.changeColor);
  }

  changeNormal() {
    this.mText.setFill(this.normalColor);
  }

  private onPointerUpHandler(pointer) {
    this.emit("click", pointer, this);
  }

  get text(): Phaser.GameObjects.Text {
    return this.mText;
  }
}
