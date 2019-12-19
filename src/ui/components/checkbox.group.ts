import { NinePatchButton } from "./ninepatch.button";
import { Logger } from "../../utils/log";

export class CheckboxGroup extends Phaser.Events.EventEmitter {
  private mList: NinePatchButton[] = [];
  private mPrevButton: NinePatchButton;
  constructor() {
    super();
  }

  public appendItem(item: NinePatchButton): this {
    this.mList.push(item);
    item.on("click", this.onGameObjectUpHandler, this);
    return this;
  }

  public appendItemAll(items: NinePatchButton[]): this {
    this.mList = this.mList.concat(items);
    for (const item of items) {
      item.on("click", this.onGameObjectUpHandler, this);
    }
    return this;
  }

  public removeItem(item: NinePatchButton): this {
    this.mList = this.mList.filter((button) => button !== item);
    item.off("click", this.onGameObjectUpHandler, this);
    return this;
  }

  public selectIndex(index: number): this {
    if (index < 0) {
      index = 0;
    }
    if (index >= this.mList.length) {
      index = this.mList.length - 1;
    }
    this.select(this.mList[index]);
    return this;
  }

  public select(item: NinePatchButton) {
    if (this.mPrevButton) {
      // this.mPrevButton
    }
    this.emit("selected", item);
  }

  private onGameObjectUpHandler(pointer, gameobject: NinePatchButton) {
    if (this.mPrevButton) {
      // this.mPrevButton.setFrame("")
    }
    this.select(gameobject);
  }
}
