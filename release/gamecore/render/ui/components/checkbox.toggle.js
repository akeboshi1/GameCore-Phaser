import { ClickEvent } from "apowophaserui";
import { ToggleButton } from "./toggle.button";
export class CheckBoxToggle extends ToggleButton {
  EventStateChange(state) {
    switch (state) {
      case ClickEvent.Up:
        this.changeNormal();
        break;
      case ClickEvent.Down:
        this.changeDown();
        break;
      case ClickEvent.Tap:
        this.isOn = !this.isOn;
        break;
      case ClickEvent.Out:
        if (this.isOn) {
          this.changeDown();
        } else {
          this.changeNormal();
        }
        break;
    }
  }
}
