import { BubbleElement } from "./BubbleElement";
import { op_client } from "pixelpai_proto";
import { UI } from "../../../Assets";

export class BubbleContainer extends Phaser.Group {
  private _bubbles: BubbleElement[];
  private _arrowImage: Phaser.Image;
  constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
    super(game, parent);
    this._bubbles = [];
  }

  public addBubble(text: string, bubble: op_client.IChat_Setting) {
    this.createBubble(text, bubble);
    const len = this._bubbles.length;
    let ele: BubbleElement = null;
    let height = 0;
    for (let i = len - 1; i >= 0; i--) {
      ele = this._bubbles[i];
      height += ele.minHeight + 5;
      ele.startTween(-height);
    }
    if (!!this._arrowImage === false) {
      this.createArrowImage();
    }
   this.visible = true;
  }

  public hideBubble() {
    for (const bubble of this._bubbles) {
      bubble.removeTween();
    }
  }

  public removeBubble(bubble: BubbleElement) {
    if (!!bubble === false) {
      return;
    }
    this._bubbles = this._bubbles.filter(val => bubble !== val);
    this.remove(bubble);
    bubble.destroy();
    if (this._bubbles.length <= 0) {
      this.visible = false;
    }
  }

  private createBubble(text: string, bubble: op_client.IChat_Setting) {
    if (!!bubble === false) return;
    const bubbleEle = new BubbleElement(this.game, this);
    bubbleEle.showText(text, bubble);
    this._bubbles.push(bubbleEle);
    let duration = bubble.duration ? bubble.duration : 5000;
    bubbleEle.durationRemove(duration, this.removeBubble, this);
  }

  private createArrowImage() {
    if (this._arrowImage) {
      this._arrowImage.destroy();
    }
    this._arrowImage = this.game.make.image(0 - this.x, -2, UI.ArrowDown.getName());
    this.add(this._arrowImage);
  }

  public destroy() {
    for (const bubble of this._bubbles) {
      bubble.destroy();
    }
    super.destroy();
  }
}