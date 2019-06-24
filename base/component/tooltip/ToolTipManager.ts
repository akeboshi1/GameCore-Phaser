import BaseSingleton from "../../BaseSingleton";

export class ToolTipManager extends BaseSingleton {
  private currentToolTip: Phaser.Group;
  public setToolTip(target: Phaser.Sprite, tooltip: Phaser.Sprite) {
    if (tooltip) {
      target.events.onInputOver.add(this.onMouseOverHandler, this);
      target.events.onInputOut.add(this.onMouseOutHandler, this);
      target.events.onInputDown.add(this.onMouseOutHandler, this);
    } else {
      target.events.onInputOver.add(this.onMouseOverHandler, this);
      target.events.onInputOut.add(this.onMouseOutHandler, this);
      target.events.onInputDown.add(this.onMouseOutHandler, this);
    }
  }

  private onMouseOverHandler(target) {
    console.log(target);
  }

  private onMouseOutHandler() {
  }
}