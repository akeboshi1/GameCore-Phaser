import { BubbleElement } from "./BubbleElement";
import { op_client } from "pixelpai_proto";

export class BubbleContainer extends Phaser.Group {
  private _bubbles: BubbleElement[];
  constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
    super(game, parent);
    this._bubbles = [];
  }

  public addBubble(text: string, bubble: op_client.IChat_Bubble) {
    this.createBubble(text, bubble);
    const len = this._bubbles.length;
    let ele: BubbleElement = null;
    let height = 0;
    for (let i = len - 1; i >= 0; i--) {
      ele = this._bubbles[i];
      height += ele.height + 5;
      ele.startTween(-height);
      // this.game.add.tween(this._bubbles[i]).to({ y: -height, alpha: 1}, 200, Phaser.Easing.Sinusoidal.InOut, true);
    }
  }

  public removeBubble(bubble: BubbleElement) {
    if (!!bubble === false) {
      return;
    }
    this._bubbles = this._bubbles.filter(val => bubble !== val);
    this.remove(bubble);
    bubble.destroy();
  }

  private createBubble(text: string, bubble: op_client.IChat_Bubble) {
    const bubbleEle = new BubbleElement(this.game, this);
    bubbleEle.showText(text, bubble);
    this._bubbles.push(bubbleEle);
    let duration = 5000;
    if (bubble.chatsetting && bubble.chatsetting.duration) {
      duration = bubble.chatsetting.duration;
    }
    bubbleEle.durationRemove(duration, this.removeBubble, this);
  }

  public destroy() {
    for (const bubble of this._bubbles) {
      bubble.destroy();
    }
    super.destroy();
  }
}