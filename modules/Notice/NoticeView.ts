import { op_client } from "pixelpai_proto";
import { ModuleViewBase } from "../../common/view/ModuleViewBase";
import { CustomWebFonts, UI } from "../../Assets";
import { GameConfig } from "../../GameConfig";
import Globals from "../../Globals";

export class NoticeView extends ModuleViewBase {
  private _context: Phaser.Text;
  private _parent: Phaser.Group;
  private _tween: Phaser.Tween;
  constructor(game: Phaser.Game, parent?: Phaser.Group) {
    super(game);
    this._parent = parent;
  }

  protected init() {
    this.game.add.nineSlice(0, 0, UI.Background.getName(), null, 1200, 120, this);
    this._context = this.game.make.text(6, 6, "", { font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), wordWrap: true, wordWrapWidth: 1180, boundsAlignH: "center", boundsAlignV: "middle", fill: "#FFF"});
    this._context.stroke = "#000000";
    this._context.strokeThickness = 2;
    this._context.setTextBounds(0, 0, 1180, 120);
    this.add(this._context);
    this.alpha = 0;
    this.x = GameConfig.GameWidth - this.width >> 1;
    this.y = 120;
  }

  public showNotice(context: string, settings?: op_client.IChat_Setting) {
    if (this._tween) {
      // this._tween.
      this.game.tweens.remove(this._tween);
    }
    this._context.setText(context);
    this._context.fill = settings.textColor ? settings.textColor : "#FFFFFF";
    Globals.Tool.formatChinese(this._context, 1180);
    this._parent.add(this);
    this.game.add.tween(this).to({ alpha: 1 }, 200, Phaser.Easing.Sinusoidal.InOut, true);
    const duration = settings.duration ? settings.duration : 5000;
    this._tween = this.game.add.tween(this).to({ alpha: 0 }, 200, Phaser.Easing.Sinusoidal.InOut, true, duration);
    this._tween.onComplete.addOnce( () => {
      this._parent.remove(this);
      this.game.tweens.remove(this._tween);
      this._tween = null;
    }, this);
  }
}