import { UI, CustomWebFonts } from "../../../Assets";
import Globals from "../../../Globals";

export class ToolTip extends Phaser.Sprite {
  protected mText: Phaser.Text;
  protected mBackground: PhaserNineSlice.NineSlice;
  protected static mInstance: ToolTip;
  constructor(game: Phaser.Game) {
    super(game, 0, 0);
    this.init();
  }

  protected init() {
    this.mText = this.game.make.text(6, 6, "", { font: "bold 15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF", wordWrap: true, wordWrapWidth: 360 });
    this.mText.stroke = "#000000";
    this.mText.strokeThickness = 1;
    this.addChild(this.mText);
  }

  public setText(text: string) {
    if (!!this.mText === false) return;
    const str = Globals.Tool.formatChineseString(text, this.mText.fontSize, this.mText.wordWrapWidth);
    this.mText.setText(str);

    if (this.mBackground) {
      this.mBackground.destroy();
    }
    this.mBackground = this.game.make.nineSlice(0, 0, UI.Background.getName(), null, this.mText.width + 20, this.mText.height + 12);
    this.addChildAt(this.mBackground, 0);
  }

  public static getInstance(game: Phaser.Game): ToolTip {
    if (!!ToolTip.mInstance === false) {
      ToolTip.mInstance = new ToolTip(game);
    }
    return ToolTip.mInstance;
  }
}