import { NinePatchButton } from "./ninepatch.button";
import { IButtonState } from "./interface/IButtonState";

export class CheckboxGroup extends Phaser.Events.EventEmitter {
  private mList: IButtonState[] = [];
  private mPrevButton: IButtonState;
  constructor() {
    super();
  }

  public appendItem(item: IButtonState): this {
    this.mList.push(item);
    item.on("click", this.onGameObjectUpHandler, this);
    return this;
  }

  public appendItemAll(items: IButtonState[]): this {
    this.mList = this.mList.concat(items);
    for (const item of items) {
      item.on("click", this.onGameObjectUpHandler, this);
    }
    return this;
  }

  public removeItem(item: IButtonState): this {
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
    if (this.mList.length > 0) {
      this.select(this.mList[index]);
    }
    return this;
  }

  public select(item: IButtonState) {
    if (this.mPrevButton === item) {
      return;
    }
    if (this.mPrevButton) {
      this.mPrevButton.changeNormal();
    }
    item.changeDown();
    this.emit("selected", item, this.mPrevButton);
    this.mPrevButton = item;
  }

  private onGameObjectUpHandler(pointer, gameobject: NinePatchButton) {
    if (this.mPrevButton) {
      // this.mPrevButton.setFrame("")
    }
    this.select(gameobject);
  }
}
