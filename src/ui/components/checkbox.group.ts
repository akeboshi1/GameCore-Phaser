import { NinePatchButton } from "./ninepatch.button";
import { Logger } from "../../utils/log";

export class CheckboxGroup {
  private mList: NinePatchButton[] = [];
  private mPrevButton: NinePatchButton;
  constructor() {
  }

  public appendItem(item: NinePatchButton) {
    this.mList.push(item);
    item.on("click", this.onGameObjectUpHandler);
  }

  public appendItemAll(items: NinePatchButton[]) {
    this.mList = this.mList.concat(items);
    for (const item of items) {
      item.on("click", this.onGameObjectUpHandler);
    }
  }

  public removeItem(item: NinePatchButton) {
    this.mList = this.mList.filter((button) => button !== item);
    item.off("click", this.onGameObjectUpHandler);
  }

  private onGameObjectUpHandler(pointer, gameobject: NinePatchButton) {
    if (this.mPrevButton) {
      // this.mPrevButton.setFrame("")
    }
    Logger.getInstance().log("click: ", gameobject);
  }
}
