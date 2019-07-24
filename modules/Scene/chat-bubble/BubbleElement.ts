import { op_client } from "pixelpai_proto";
import { UI } from "../../../Assets";
import Globals from "../../../Globals";
import { DynamicNiceSliceImage } from "../../../base/component/image/DynamicNiceSliceImage";
const setTimeout = window.setTimeout;

export class BubbleElement extends Phaser.Group {
  protected bg: PhaserNineSlice.NineSlice;
  protected chat_content: Phaser.Text;
  protected headImage: Phaser.Image;
  protected _removeDelay: number;
  protected _completeCallback: Function;
  protected _completeCallbackContext: any;
  protected _y: number;
  constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
    super(game, parent);
  }

  public showText(text: string, bubble: op_client.IChat_Setting) {
    this.chat_content = this.game.make.text(20, 10, text, { fontSize: 12, wordWrap: true, wordWrapWidth: 320 });
    this.chat_content.smoothed = false;
    Globals.Tool.formatChinese(this.chat_content, 320);
    this.add(this.chat_content);

    this.bg = this.game.make.nineSlice(0, 0, UI.ChatBubble.getName(), null, this.chat_content.width + 40, this.chat_content.height + 18);
    // this.bg = new DynamicNiceSliceImage(this.game, this.chat_content.width + 40, this.chat_content.height + 18);
    // this.bg.load()
    this.addAt(this.bg, 0);
    this.alpha = 0;
  }

  public startTween(toY: number) {
    this._y = toY;
    this.game.add.tween(this).to({ y: toY, alpha: 1 }, 200, Phaser.Easing.Sinusoidal.InOut, true);
  }

  public durationRemove(duration: number, callback?: Function, callbackContext?: any) {
    this._completeCallback = callback;
    this._completeCallbackContext = callbackContext;
    this._removeDelay = setTimeout(() => {
      this.removeTween();
    }, duration);
  }

  public removeTween() {
    clearTimeout(this._removeDelay);
    const endY = this._y - 50;
    const tween = this.game.add.tween(this).to({ y: endY, alpha: 0 }, 200, Phaser.Easing.Sinusoidal.InOut, true);
    tween.onComplete.addOnce(() => {
      if (this._completeCallback) {
        this._completeCallback.call(this._completeCallbackContext, this);
      }
    });
  }

  public get locY(): number {
    return this._y;
  }
}