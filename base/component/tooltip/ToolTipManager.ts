import BaseSingleton from "../../BaseSingleton";
import Globals from "../../../Globals";
import { ToolTip } from "./ToolTip";

export class ToolTipManager extends BaseSingleton {
  // private toolTipTarget: Phaser.Sprite;
  private currentToolTip: ToolTip;
  private toolTipMap: Map<Phaser.Sprite, ToolTip> = new Map();
  public setToolTip(target: Phaser.Sprite, tooltip: ToolTip) {
    if (tooltip) {
      this.toolTipMap.set(target, tooltip);
      target.events.onInputOver.add(this.onMouseOverHandler, this);
      target.events.onInputOut.add(this.onMouseOutHandler, this);
      target.events.onInputDown.add(this.onMouseOutHandler, this);
    } else {
      target.events.onInputOver.remove(this.onMouseOverHandler, this);
      target.events.onInputOut.remove(this.onMouseOutHandler, this);
      target.events.onInputDown.remove(this.onMouseOutHandler, this);
      this.toolTipMap.delete(target);
    }
  }

  private onMouseOverHandler(target, pointer) {
    // this.toolTipTarget = target;
    if (target) {
      this.currentToolTip = this.toolTipMap.get(target);
      if (this.currentToolTip) {
        if (!this.currentToolTip.parent) {
          target.initToolTip();
          Globals.LayerManager.tipLayer.add(this.currentToolTip);
          this.currentToolTip.x = pointer.x;
          this.currentToolTip.y = pointer.y;
        }
      }
    }
  }

  private onMouseOutHandler() {
    if (this.currentToolTip) {
      if (this.currentToolTip.parent) {
        this.currentToolTip.parent.removeChild(this.currentToolTip);
      }
    }
  }
}